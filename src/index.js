const express = require('express');
const cors = require('cors');
const { v4: uuidv4, v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find(user => user.username == username)

  if (!user) {
    return response.status(404).json({ error: "Mensagem do erro" })
  }

  request.user = user

  next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body
  const usernameAlreadyExists = users.find(user => user.username == username)

  if (usernameAlreadyExists) {
    return response.status(400).json({ error: 'username already exists' })
  }

  const newUser = {
    id: v4(), // precisa ser um uuid
    name: name,
    username: username,
    todos: []
  }

  users.push(newUser)

  return response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline, created_at } = request.body
  const { user } = request

  const newTodo = {
    id: v4(), // precisa ser um uuid
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo)

  return response.status(201).json(newTodo)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request
  const { id } = request.params
  const todoItem = user.todos.find(item => item.id == id)

  if (!todoItem) {
    return response.status(404).json({ error: 'item não encontrado' })
  }

  todoItem.title = title
  todoItem.deadline = deadline

  return response.status(201).json(todoItem)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const todoItem = user.todos.find(item => item.id == id)

  if (!todoItem) {
    return response.status(404).json({ error: 'item não encontrado' })
  }

  todoItem.done = true

  return response.status(201).json(todoItem)

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const todoItemIndex = user.todos.findIndex(item => item.id == id)

  if (todoItemIndex === -1) {
    return response.status(404).json({ error: 'item não encontrado' })
  }

  user.todos.splice(todoItemIndex, 1)

  return response.status(204).json()
});

module.exports = app;