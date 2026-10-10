
const { buildSchema } = require('graphql');

let tasks = [
  { id: '1', jobtodo: 'assignment', toggle: 0 },
  { id: '2', jobtodo: 'record', toggle: 0 }
];

const schema = buildSchema(`
  type Task {
    id: ID!
    jobtodo: String!
    toggle: Int!
  }

  type Query {
    msglist: [Task!]!
    getTaskById(id: ID!): Task
  }

  type Mutation {
    createTask(jobtodo: String!): Task!
    updateTask(id: ID!, jobtodo: String!): Task
    deleteTask(id: ID!): Boolean!
    toggleTask(id: ID!, toggle: Int!): Task
  }
`);

const root = {
  msglist: () => tasks,

  getTaskById: ({ id }) =>
    tasks.find(task => task.id === id) || null,

  createTask: ({ jobtodo }) => {
    if (!jobtodo.trim()) {
      throw new Error('Task cannot be empty');
    }

    const task = {
      id: String(Date.now()),
      jobtodo: jobtodo.trim(),
      toggle: 0
    };

    tasks.push(task);
    return task;
  },

  updateTask: ({ id, jobtodo }) => {
    if (!jobtodo.trim()) {
      throw new Error('Task cannot be empty');
    }

    const task = tasks.find(task => task.id === id);
    if (!task) return null;

    task.jobtodo = jobtodo.trim();
    return task;
  },

  deleteTask: ({ id }) => {
    const oldLength = tasks.length;
    tasks = tasks.filter(task => task.id !== id);
    return tasks.length < oldLength;
  },

  toggleTask: ({ id, toggle }) => {
    const task = tasks.find(task => task.id === id);
    if (!task) return null;

    if (toggle !== 0 && toggle !== 1) {
      throw new Error('Toggle must be 0 or 1');
    }

    task.toggle = toggle;
    return task;
  }
};

module.exports = { schema, root };
