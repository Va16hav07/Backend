
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/user', (req, res) => {
    const user = {
        firstName: "Firstname",
        lastName: "Lastname",
        email: "Write the email"
    };
    res.json(user);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
