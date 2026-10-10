
const endpoint = '/graphql';

async function graphql(query, variables = {}) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
}

async function loadTasks() {
  try {
    const data = await graphql(`
      query {
        msglist {
          id
          jobtodo
          toggle
        }
      }
    `);

    const list = document.getElementById('taskList');
    list.replaceChildren();

    data.msglist.forEach(task => {
      const row = document.createElement('div');
      row.className = 'task';

      const status = document.createElement('button');
      status.textContent = task.toggle ? '✓' : '○';

      const title = document.createElement('span');
      title.textContent = task.jobtodo;

      if (task.toggle) title.classList.add('completed');

      status.onclick = async () => {
        await graphql(`
          mutation($id: ID!, $toggle: Int!) {
            toggleTask(id: $id, toggle: $toggle) {
              id
            }
          }
        `, {
          id: task.id,
          toggle: task.toggle ? 0 : 1
        });
        loadTasks();
      };

      const edit = document.createElement('button');
      edit.textContent = 'Edit';
      edit.onclick = async () => {
        const value = prompt('Edit task:', task.jobtodo);
        if (value === null || !value.trim()) return;

        await graphql(`
          mutation($id: ID!, $jobtodo: String!) {
            updateTask(id: $id, jobtodo: $jobtodo) {
              id
            }
          }
        `, { id: task.id, jobtodo: value.trim() });

        loadTasks();
      };

      const remove = document.createElement('button');
      remove.textContent = 'Delete';
      remove.onclick = async () => {
        if (!confirm('Delete this task?')) return;

        await graphql(`
          mutation($id: ID!) {
            deleteTask(id: $id)
          }
        `, { id: task.id });

        loadTasks();
      };

      row.append(status, title, edit, remove);
      list.appendChild(row);
    });
  } catch (error) {
    alert(error.message);
  }
}

document.getElementById('taskForm').addEventListener(
  'submit',
  async event => {
    event.preventDefault();

    const input = document.getElementById('taskInput');
    const jobtodo = input.value.trim();

    if (!jobtodo) return;

    try {
      await graphql(`
        mutation($jobtodo: String!) {
          createTask(jobtodo: $jobtodo) {
            id
          }
        }
      `, { jobtodo });

      input.value = '';
      await loadTasks();
    } catch (error) {
      alert(error.message);
    }
  }
);

loadTasks();
