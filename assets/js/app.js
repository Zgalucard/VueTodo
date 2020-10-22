var STORAGE_KEY_ONE = "storage_one";
var STORAGE_KEY_TWO = "storage_two";

var todoStorage = {
    fetch: function () {
        var todos = JSON.parse(localStorage.getItem(STORAGE_KEY_ONE) || "[]");
        todos.forEach(function (todo, index) {
            todo.id = index + 1;
        });
        todoStorage.uid = todos.length;
        return todos;
    },

    save: function (todos) {
        localStorage.setItem(STORAGE_KEY_ONE, JSON.stringify(todos));
    }

};

var subTodoStorage = {
    subFetch: function () {
        var subTodos = JSON.parse(localStorage.getItem(STORAGE_KEY_TWO) || "[]");
        subTodos.forEach(function (subTodo, subIndex) {
            subTodo.sid = subIndex + 1;
        });
        subTodoStorage.usid = subTodos.length;
        return subTodos;
    },

    subSave: function (subTodos) {
        localStorage.setItem(STORAGE_KEY_TWO, JSON.stringify(subTodos));
    }
}

var filters = {
    active: function (todos) {
        return todos.filter(function (todo) {
            return !todo.completed;
        });
    },
    completed: function (todos) {
        return todos.filter(function (todo) {
            return todo.completed;
        });
    }
};

var app = new Vue({
    el: "#app",
    data() {
        return {
            todos: todoStorage.fetch(),
            newTodo: "",
            editedTodo: null,
            visibility: "active",
            search: null,
            date: "",
            time: "",
            subTodos: subTodoStorage.subFetch(),
            newSubTodo: "",
            valueParentTitle: ""
        }
    },
    watch: {
        todos: {
            handler: function (todos) {
                todoStorage.save(todos);
                // console.log(todos);
            },
            deep: true
        },

        subTodos: {
            handler: function (subTodos) {
                subTodoStorage.subSave(subTodos);
                // console.log(subTodos);
            },
            deep: true
        }
    },
    computed: {
        filteredTodos: function () {
            if (!this.search) {
                return filters[this.visibility](this.todos);
            } else {
                return filters[this.visibility](this.todos.filter(todos => todos.title.toLowerCase().includes(this.search.toLowerCase())));
            }
            // return filters[this.visibility](this.todos);
        },
        remaining: function () {
            return filters.active(this.todos).length;
        },
        allDone: {
            get: function () {
                return this.remaining === 0;
            },
            set: function (value) {
                this.todos.forEach(function (todo) {
                    todo.completed = value;
                });
            }
        },
    },
    filters: {
        pluralize: function (n) {
            return n === 1 ? "item" : "items";
        }
    },
    methods: {
        addTodo: function () {
            var value = this.newTodo;

            this.todos.push({
                id: todoStorage.uid++,
                title: value,
                completed: false,
                date: value,
                time: value,
                subtasksShow: false,
                taskDate: false
            });
        },

        addSubTodo: function (todo) {
            var subValue = this.newSubTodo;
            var parenId = todo.id

            this.subTodos.push({
                sid: subTodoStorage.usid++,
                subTitle: subValue,
                completed: false,
                parenId: parenId
            });
        },

        removeTodo: function (todo) {
            this.todos.splice(this.todos.indexOf(todo), 1);

//            this.subTodos.forEach(function (subTodo, i, subTodos) {
//                if (subTodo.parenId === todo.id) {
//                    console.log("forEach " + i + " :index - el: " + subTodo.parenId);
//                    subTodos.splice(subTodo.parenId, 1);
//                    console.log(subTodos.splice(subTodo.parenId, 1));
//                    i--;
//                }
//            });

            for ([i, subTodo] of this.subTodos.entries()) {
                if (subTodo.parenId === todo.id) {
//                    console.log(i + " + " + subTodo);
//                    console.log("for of " + i + " :index - el: " + subTodo.parenId);
                    this.subTodos.splice(i, 1);
//                    console.log(this.subTodos.splice(i, 1));
                    i--;
                    subTodo--;
//                    console.log(i + " - " + subTodo);
                }
            }
        },

        removeSubTodo: function (subTodo) {
            this.subTodos.splice(this.subTodos.indexOf(subTodo), 1);
        },

        editTodo: function (todo) {
            this.beforeEditCache = todo.title;
            this.editedTodo = todo;
        },

        doneEdit: function (todo) {
            if (!this.editedTodo) {
                return;
            }
            this.editedTodo = null;
            if (!todo.title) {
                this.removeTodo(todo);
            }
        },

        cancelEdit: function (todo) {
            this.editedTodo = null;
            todo.title = this.beforeEditCache;
        },

        removeCompleted: function () {
            this.todos = filters.active(this.todos);
        },
    },
    directives: {
        "todo-focus": function (el, binding) {
            if (binding.value) {
                el.focus();
            }
        }
    }
});

function onHashChange() {
    var visibility = window.location.hash.replace(/#\/?/, "");
    if (filters[visibility]) {
        app.visibility = visibility;
    } else {
        window.location.hash = "";
        app.visibility = "active";
    }
}

window.addEventListener("hashchange", onHashChange);
onHashChange();
