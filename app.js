

var todosApi = 'https://62d83b1f90883139358dd15b.mockapi.io/todos'

function start() {
    getTodosListApi(renderTodosList)

    // Vì hàm handleEditTask() sẽ thực hiện việc
    // thay thế nút "New task" thành nút "Replace"
    // nên DOM sẽ không còn tồn tại nút "New task" cũ nữa
    // mà phải chạy lại hàm mỗi lần click vào input
    // để lấy lại nút mới trong DOM
    var titleInputToStartCreateFunction = document.querySelector('.todo-input input[name = "title"')
    titleInputToStartCreateFunction.onclick = function() {
        handleCreateTask()
    }
}
start()

function getTodosListApi(callback) {
    fetch(todosApi)
        .then(function(response) {
            return response.json()
        })
        .then(callback)
        .catch(function(err) {
            console.log(err)
        })
}

function htmlTemplateRender(objectData) {
    // Thẻ <li></li> ảo bao quanh thẻ chính
    var fakeItemBlock = document.createElement('li')

    var status = ''
    if(objectData.complete == true) {
        status = 'checked'
    }
    fakeItemBlock.innerHTML = `
    <li class="todo-item" id="item${objectData.id}">
        <div class="todo-item__status">
            <input type="checkbox" name="status" onclick="handleCheckedTask(${objectData.id}, '${objectData.title}', '${objectData.description}', ${objectData.complete})" ${status}>
        </div>
        <div class="todo-item__content">
            <h4 class="todo-item__title">${objectData.title}</h4>
            <p class="todo-item__desc">${objectData.description}</p>
        </div>
        <div class="todo-item__controls">
            <div class="todo-item__edit" onclick="handleEditTask(${objectData.id}, '${objectData.title}', '${objectData.description}', ${objectData.complete})">
                <i class="material-symbols-outlined">edit</i>
            </div>
            <div class="todo-item__remove" onclick="handleDeleteTask(${objectData.id})">
                <i class="material-symbols-outlined">delete</i>
            </div>
        </div>
    </li>
    `
    return fakeItemBlock
}

function renderTodosList(todosList) {
    var todosBlock = document.querySelector('.todos-list')

    var todosHTML = todosList.map(function(todo) {

        // Chỉ lấy thẻ <li></li> chính và loại bỏ thẻ ảo
        // bên ngoài
        return htmlTemplateRender(todo).innerHTML
    })
    todosBlock.innerHTML = todosHTML.join(' ')
}

function createTask(data, callback) {
    var options = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    }

    fetch(todosApi, options)
        .then(function(response) {
            return response.json()
        })
        .then(callback)
        .catch(function(err) {
            console.log(err)
        })
}

function handleCreateTask() {
    var createBtn = document.querySelector('.todo-input__submit #submit')
    // Khi thực hiện replace nút "New task"
    // sẽ biến thành "Replace" nên sẽ không tồn tại trên DOM
    // nên phải kiểm tra xem có tồn tại hay không
    if(createBtn != null) {
        createBtn.onclick = function() {
            var title = document.querySelector('.todo-input input[name = "title"').value
            var description = document.querySelector('.todo-input input[name = "description"]').value
            var createData = {
                title: title,
                description: description,
                complete: false
            }
            createTask(createData, addItemToList)
            function addItemToList(responseItem) {
                var todosBlock = document.querySelector('.todos-list')
                var itemBlock = htmlTemplateRender(responseItem)
    
                // Chỉ lấy thẻ <li></li> chính bên trong thẻ ảo
                // bên ngoài do hàm htmlTemplateRender() trả về
                todosBlock.appendChild(itemBlock.firstElementChild)
            }
    
            // Xóa input vừa nhập sau khi tạo thành công
            resetInput()
        }
    }
}


function handleDeleteTask(id) {
    var options = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    }

    fetch(todosApi + '/' + id, options)
        .then(function(response) {
            return response.json()
        })
        .then(function() {
            var todoItem = document.getElementById('item' + id)
            todoItem.remove()
        })
        .catch(function(err) {
            console.log(err)
        })
}

function updateTask(id, data, callback) {
    var options = {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    }
    fetch(todosApi + '/' + id, options)
        .then(function(response) {
            return response.json()
        })
        .then(callback)
        .catch(function(err) {
            console.log(err)
        })
}

function handleCheckedTask(id, title, description, complete) {
    
    if(complete == true) {
        complete = false
    }else complete = true

    var data = {
        title: title,
        description: description,
        complete: complete,
        id: id
    }
    console.log(data)

    updateTask(id, data, replaceItemFromList)
    function replaceItemFromList(responseItem) {
        var todosBlock = document.querySelector('.todos-list')
        
        // oldItem là phần tử con của todosBlock
        // thì mới thực hiện thay thế được
        var oldItem = document.getElementById('item' + id)
        var newItem = htmlTemplateRender(responseItem)
    
        // Chỉ lấy thẻ <li></li> chính bên trong thẻ ảo
        // bên ngoài do hàm htmlTemplateRender() trả về
        todosBlock.replaceChild(newItem.firstElementChild, oldItem)
    }
}

function handleEditTask(id, title, description, complete) {
    var submitBlock = document.querySelector('.todo-input__submit')
    submitBlock.innerHTML = `
    <button class="btn" id="replace">Replace</button>
    `

    var title = document.querySelector('.todo-input input[name = "title"').value = title
    var description = document.querySelector('.todo-input input[name = "description"]').value = description

    var replaceBtn = document.querySelector('.todo-input__submit #replace')
    replaceBtn.onclick = function() {
        var title = document.querySelector('.todo-input input[name = "title"').value
        var description = document.querySelector('.todo-input input[name = "description"]').value
        var data = {
            title: title,
            description: description,
            complete: complete,
            id: id
        }

        updateTask(id, data, replaceItemFromList)
        function replaceItemFromList(responseItem) {
            var todosBlock = document.querySelector('.todos-list')
            
            // oldItem là phần tử con của todosBlock
            // thì mới thực hiện thay thế được
            var oldItem = document.getElementById('item' + id)
            var newItem = htmlTemplateRender(responseItem)
        
            // Chỉ lấy thẻ <li></li> chính bên trong thẻ ảo
            // bên ngoài do hàm htmlTemplateRender() trả về
            todosBlock.replaceChild(newItem.firstElementChild, oldItem)
        }

        submitBlock.innerHTML = `
        <button class="btn" id="submit">New task</button>
        `
        resetInput()
    }
}

function resetInput () {
    var title = document.querySelector('.todo-input input[name = "title"').value = ''
    var description = document.querySelector('.todo-input input[name = "description"]').value = ''
}