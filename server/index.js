const express = require("express");
const app = express();
const fs = require("fs");
const cors = require("cors")

app.use(cors());
app.use(express.json());

const loadJSON = (fileName = "") => {
    return JSON.parse(
        fs.existsSync(fileName)
            ? fs.readFileSync(fileName).toString()
            : '""'
    );
};

const saveJSON = (fileName = '', json = '""') => {
    return fs.writeFileSync(fileName, JSON.stringify(json, null, 2));
};

app.get("/subjects", (req, res) => {
    const db = loadJSON("data.json");
    res.send({subjects: db.subjects});
});

app.get("/test-questions", (req, res) => {
    const db = loadJSON("data.json");
    res.send({testQuestions: db.testQuestions});
});

app.post("/auth", (req, res) => {
    const db = loadJSON("data.json");
    const {subjectId, password} = req.body;
    // Check if GLaDOS
    const gladosUser = db.GLaDOS;
    if (gladosUser.subjectId === subjectId && gladosUser.password === password) {
        res.send({
            user: {subjectId: subjectId, userType: "glados"}
        });
        return;
    }
    // Check if subject can be found
    const user = db.subjects.find((subject) => subject.subjectId === subjectId);
    if (!user) throw new Error("Username or password is incorrect");
    // Check if password is correct
    if (user.password === password) {
        res.send({
            user: {subjectId: subjectId, userType: "subject"}
        })
    }
});

app.post("/submit-answers", (req, res) => {
    let db = loadJSON("data.json");
    const {subjectId, answers} = req.body;
    const newId = db.testSubmissions.length + 1; // Janky solution to auto increment
    let responses = [];
    for (const id in answers) {
        const response = {id: id, value: answers[id].value};
        responses.push(response);
    }
    db.testSubmissions.push({
        id: newId,
        subjectId,
        responses,
    });
    saveJSON("data.json", db);
    res.send({db: db});
});

app.listen(3001, () => {
    console.log("Listening on port 3001...")
});