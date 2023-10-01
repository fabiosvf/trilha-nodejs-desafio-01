import { randomUUID } from 'node:crypto';
import { Database } from './database.js';
import { buildRoutePath } from './utils/build-route-path.js';

const database = new Database();

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query;

      const tasks = database.select('tasks', search ? {
        title: search,
        description: search
      } : null);
      return res.end(JSON.stringify(tasks));
    }
  }, {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      
      const { title, description } = req.body;

      const errorList = [];

      if (!title) {
        errorList.push('Title is required');
      }

      if (!description) {
        errorList.push('Description is required');
      }

      if (errorList.length > 0) {
        return res.writeHead(500, {"Content-Type": 'application/json' }).end(JSON.stringify(errorList));
      }

      const task = {
          id: randomUUID(),
          title,
          description,
          completed_at: null,
          created_at: new Date(),
          updated_at: null
        };

      database.insert('tasks', task);

      return res.writeHead(201).end();
    }
  }, {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params;

      const { title, description } = req.body;

      const errorList = [];

      const task = database.select_id('tasks', id);

      if (!task) {
        errorList.push('Id not found');
      }

      if (!title && !description) {
        errorList.push('Title or Description is required');
      }

      if (errorList.length > 0) {
        return res.writeHead(500, {"Content-Type": 'application/json' }).end(JSON.stringify(errorList));
      }

      const { completed_at, created_at } = task;
      database.update('tasks', id, { 
        title: title ?? task.title, 
        description: description ?? task.description,
        completed_at,
        created_at,
        updated_at: new Date()
      });
      
      return res.writeHead(204).end();
    }
  }, {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params;

      const errorList = [];

      const task = database.select_id('tasks', id);

      if (!task) {
        errorList.push('Id not found');
      }

      if (errorList.length > 0) {
        return res.writeHead(500, {"Content-Type": 'application/json' }).end(JSON.stringify(errorList));
      }

      database.delete('tasks', id);
      
      return res.writeHead(204).end();
    }
  }, {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params;

      const errorList = [];

      const task = database.select_id('tasks', id);

      if (!task) {
        errorList.push('Id not found');
      }

      if (errorList.length > 0) {
        return res.writeHead(500, {"Content-Type": 'application/json' }).end(JSON.stringify(errorList));
      }

      const { title, description, completed_at, created_at } = task;
      database.update('tasks', id, { 
        title, 
        description,
        completed_at: (completed_at ? null : new Date()),
        created_at,
        updated_at: new Date()
      });

      return res.writeHead(204).end();
    }
  }
]