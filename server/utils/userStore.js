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

function userExists(username) {
    const users = loadUsers();
    return users.some(user => user.name === username);
}

function addUser(username) {
    const users = loadUsers();
    users.push({ name: username });
    saveUsers(users);
}

module.exports = {
    loadUsers,
    saveUsers,
    userExists,
    addUser
};