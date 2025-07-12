// Deprecated
// Database has replaced local disk storage 

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/users.json');

function loadUsers() {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
}

function saveUsers(users) {
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
}

function getUser(username) {
    const users = loadUsers();
    return users.find(user => user.name === username);
}

function addUser(username, passwordHash) {
    const users = loadUsers();
    users.push({ name: username, passwordHash });
    saveUsers(users);
}

module.exports = {
    loadUsers,
    saveUsers,
    addUser,
    getUser
};