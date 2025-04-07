const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");

const app = express();

// Configure Handlebars
app.engine(
    "hbs",
    exphbs({
        extname: ".hbs",
        partialsDir: "/home/user/Documents/projects/nsc-system-backend/src/views/partials", // Absolute path to the partials directory
    })
);
app.set("view engine", "hbs");

// Example route
app.get("/", (req, res) => {
    res.render("example", {
        firstName: "John",
        lastName: "Doe",
        role: "Teacher",
        instituteName: "Example School",
        email: "john@example.com",
        year: new Date().getFullYear(),
        supportEmail: "support@example.com",
    });
});

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
