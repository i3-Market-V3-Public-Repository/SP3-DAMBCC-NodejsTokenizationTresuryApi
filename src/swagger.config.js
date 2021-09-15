const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title:'i3Treasury API',
            version:'1.0.0',
            license: {
                name: 'Licensed Under MIT',
                url: 'https://spdx.org/licenses/MIT.html',
            },
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: 'Development server',
            },
        ],

    },
    apis:[path.join(__dirname,'./routes/**.js')],
}

module.exports = swaggerJSDoc(swaggerOptions);