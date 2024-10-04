
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/user', (req, res) => {
    const user = {
        firstName: "Vaibhav",
        lastName: "Kumawat",
        email: "vaibhavkumawat7605@gmail.com"
    };
    res.json(user);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
