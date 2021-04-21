"use strict";
// import { Request, Response, NextFunction } from "express";
// export const createTodo = (req: Request, res: Response, next: NextFunction) => {};
// BETTER WAY TO WRITE:
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTodo = exports.updateTodo = exports.getTodos = exports.postTodo = void 0;
const todo_1 = require("../models/todo");
// Working just in memory, could use MongoDB
const TODOS = [];
exports.postTodo = (req, res, next) => {
    // Type casting
    const text = req.body.text;
    const newTodo = new todo_1.Todo(Math.random().toString(), text);
    TODOS.push(newTodo);
    // 201: Created
    res.status(201).json({ message: "TODO Created!", createdTodo: newTodo });
    console.log(TODOS);
};
exports.getTodos = (req, res, next) => {
    res.status(200).json({ message: "Listing all TODOS:", todos: TODOS });
};
exports.updateTodo = (req, res, next) => {
    const todoId = req.params.id;
    const updatedText = req.body.text;
    const todoIndex = TODOS.findIndex((el) => el.id === todoId);
    if (todoIndex < 0) {
        throw new Error("Todo not found!");
    }
    TODOS[todoIndex] = new todo_1.Todo(TODOS[todoIndex].id, updatedText);
    res.status(200).json({ message: "Updated!", updatedTodos: TODOS });
};
exports.deleteTodo = (req, res, next) => {
    const todoId = req.params.id;
    const todoIndex = TODOS.findIndex((el) => el.id === todoId);
    if (todoIndex < 0) {
        throw new Error("Todo not found!");
    }
    TODOS.splice(todoIndex, 1);
    res.status(200).json({ message: "Deleted!", updatedTodos: TODOS });
};
