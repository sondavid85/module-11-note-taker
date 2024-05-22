const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(__dirname + '/public/'));

app.get('/notes', (req, res) => {
    let notes = JSON.parse(fs.readFileSync('./db/db.json', 'utf8'));
    res.render('notes', {notes});
});

app.get('/note/:id', (req, res) => {
    const noteId = parseInt(req.params.id, 10);
    fs.readFile(path.join(__dirname, '/db/db.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading notes');
        }
        const notes = JSON.parse(data);
        const note = notes[noteId];
        if (note) {
            res.json(note);
        } else {
            res.status(404).send('Note not found');
        }
    });
});

app.delete('/note/:id', (req, res) => {
    const noteId = parseInt(req.params.id, 10);
    fs.readFile(path.join(__dirname, '/db/db.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading notes');
        }
        let notes = JSON.parse(data);
        notes.splice(noteId, 1);
        fs.writeFile(path.join(__dirname, '/db/db.json'), JSON.stringify(notes, null, 2), 'utf8', (err) => {
            if (err) {
                return res.status(500).send('Error deleting note');
            }
            res.json({ success: true });
        })        
    });
});

app.post('/savenote', (req, res) => {
    let {title, text} = req.body;
    let existingNoteIndex = -1;

    fs.readFile(path.join(__dirname, '/db/db.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading notes');
        }
        
        let notes = JSON.parse(data);
        existingNoteIndex = notes.findIndex(n => n.title.toLowerCase() === title.toLowerCase());
        if (existingNoteIndex != -1) {
            notes[existingNoteIndex].title = title;
            notes[existingNoteIndex].text = text;
        }
        else {
            notes.push({"title": title, "text": text});
        }

        fs.writeFile(path.join(__dirname, '/db/db.json'), JSON.stringify(notes, null, 2), 'utf8', (err) => {
            if (err) {
                return res.status(500).send('Error saving note');
            }
            res.json({ success: true, wasExistingNote: existingNoteIndex !== -1 });
        })        
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public','index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});