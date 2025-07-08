module.exports = {
    apps: [
        {
            name: "selfie-be",
            script: "dist/index.js",
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: "300M"
        }
    ]
};