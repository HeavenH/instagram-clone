const services = require('../services');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

module.exports = {
    async index(req, res) {
        const posts = await services.findPost({
            order: [['createdAt', 'DESC']]
        })
        res.json(posts);
    },

    async store(req, res) {
        const { author, place, description, hashtags } = req.body;
        const { filename: image } = req.file;

        const [name] = image.split('.');
        const fileName = `${name}.jpg`;

        await sharp(req.file.path)
            .resize(500)
            .jpeg({ quality: 70 })
            .toFile(
                path.resolve(req.file.destination, 'resized', fileName)
            )

        fs.unlinkSync(req.file.path);

        const post = await services.createPost({
            author,
            place,
            description,
            hashtags,
            fileName
        });

        req.io.emit('post', post);

        return res.send(post);
    }
};