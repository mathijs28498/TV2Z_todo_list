// GLOBAL VARIABLES

const isAdmin = true;
let showSearch = false;

let todoItemArray = [];
let logInDetails = [
    ['user', 'pass'],
    ['admin', 'admin'],
    ['please', 'let me in'],
    ['mathijs', 'frank']
];


// CLASSES 

/**
 * Single tag
 */
class Tag {
    constructor(title) {
        this.title = title;
    }

    /**
     * Creates the html for this tag
     */
    getHTML(isRemovable) {
        return getTagHTML(this.title, isRemovable);
    }
}

/**
 * Creates HTML for a tag
  * @param {boolean} isRemovable True if the tag can be removed (edited)
  */
function getTagHTML(title, isRemovable) {
    return '<div class="todo_tag' + (isRemovable ? ' removable_tag' : '')
        + '"><span class="tag_title">' + title + '</span>'
        + (isRemovable ? '<span class="remove_tag">x</span>' : '') + '</div>'
}

/**
 * Single todo item
 */
class TodoItem {
    constructor(title, description, tagList) {
        this.title = title;
        this.description = description;
        this.tagList = tagList;
    }

    /**
     * Creates the html for this todo item
     */
    getHTML() {
        let resHTML = '<li class="todo_item">'
            + '<p class="todo_item_edit_buttons"><span class="edit_todo_item">edit</span><span class="remove_todo_item">remove</span></p>';
        resHTML += '<p class="todo_title">' + this.title + '</p>';
        resHTML += '<p class="todo_description">' + this.description + '</p>'

        resHTML += "<div class='todo_edit_input_tags'></div>"
        resHTML += '<div class="todo_tags">';
        this.tagList.forEach(el => {
            resHTML += el.getHTML(false);
        });

        resHTML += '</div>';
        resHTML += '</li>';

        return resHTML;
    }

    /**
     * Adds item to the html of item list, when the search field is empty
     */
    addToItemList() {
        if (!showSearch) {
            $('#item_list').append(this.getHTML());
        }
    }
}


// COMMON

/**
 * Add user log in when admin is true
 */
$(document).ready(function () {
    if (isAdmin) {
        let adminOnly = $('#admin_only');
        adminOnly.append('<h1>ADMIN ONLY --- Highly sensitive data --- DO NOT SHARE!</h1>');
        logInDetails.forEach(el => {
            adminOnly.append('<p>Username: ' + el[0] + '<br/> Password: ' + el[1] + '</p>');
        });
    }
});

/**
 * Adds active class to object if it doesn't contain active class
 * @param {JQuery} object The jQuery object that is changed
 */
function addActiveClass(object) {
    if (!object.hasClass('active')) object.addClass('active');
}

/**
 * Add all todos from todoItemArray to the html
 */
function appendTodoItems() {
    todoItemArray.forEach(el => {
        $('#item_list').append(el.getHTML());
    });
}

/**
 * Adds a tag to a div
 * @param {JQuery} element Tag field to be set to empty string
 * @param {String} value Title of the tag
 * @param {JQuery} tagDiv Div to add tag
 * @param {Event} event 
 */
function addTag(element, value, tagDiv) {
    if (value !== '') {
        tagDiv.append(getTagHTML(value, true));
    }
    element.val("");
}

/**
 * Turns a JSON object into individual todo items and adds them to the todoItemArray
 * @param {JSON} jsonObject The JSON object
 */
function jsonToTodoItem(jsonObject) {
    let tagList = [];
    let tagListJSON = jsonObject.tagList;
    for (let i = 0; i < tagListJSON.length; i++) {
        tagList.push(new Tag(tagListJSON[i].title));
    }
    return new TodoItem(jsonObject.title, jsonObject.description, tagList);
}

/**
 * Get the index of a todo based on title and description
 */
function getTodoIndex(title, description) {
    for (let i = 0; i < todoItemArray.length; i++) {
        if (todoItemArray[i].title === title
            && todoItemArray[i].description === description) {
            return i;
        }
    }

    return -1;
}

// LOG IN/LOG OUT

/**
 * Handles log in based on username and password fields
 */
$('#log_in_form').on('submit', function (e) {
    // Prevents reloading page
    e.preventDefault();

    let user = $(this).find('#username');
    let pass = $(this).find('#password');

    // Checks for valid log in credentials
    let canLogIn = false;
    for (let i = 0; i < logInDetails.length; i++) {
        const el = logInDetails[i];
        if (user.val() === el[0] && pass.val() === el[1]) {
            canLogIn = true;
            break;
        }
    }

    // Error message field
    let invalidLogIn = $('#invalid_log_in');

    if (canLogIn) {
        // Switches views, sets user data, loads todos
        invalidLogIn.removeClass('active');
        $(this).parent().parent().addClass('is_logged_in');
        $('#todo_app').data('user', user.val());
        $('#welcome_username').html(user.val());
        loadTodos();
    } else {
        addActiveClass($(invalidLogIn));
    }

    // Clears input fields
    user.val('');
    pass.val('');
});

/**
 * Handles log out
 */
$('#log_out').click(function () {
    // Save current todos
    saveTodos();

    // Switches views
    $(this).parent().parent().removeClass('is_logged_in');

    // Clears application view/ resets variables
    let todoTitle = $('#todo_title_input');
    let todoDescription = $('#todo_description_input');
    todoTitle.val('');
    todoTitle.removeClass('empty');

    todoDescription.val('');
    todoDescription.removeClass('empty');

    $('.todo_tags_input').val('');
    $('.todo_tags_input_container').html('');
    $('#todo_search').val('');
    $('#item_list').html('');
    $('#double_todo').removeClass('active');

    todoItemArray = [];
    showSearch = false;
});


// ADDING TODOS

/**
 * Handles creating todo item when submitted in the right form
 */
$('#add_todo_form').on('submit', function (e) {
    // Prevents refresh
    e.preventDefault();

    // Get values for later use
    let todoTitle = $(this).find('#todo_title_input');
    let todoDescription = $(this).find('#todo_description_input');
    let todoTitleVal = todoTitle.val();
    let todoDescriptionVal = todoDescription.val();

    //Checks if title and description fields are not empty
    if (todoTitleVal !== "" && todoDescriptionVal !== "") {
        // Remove error handling
        todoTitle.removeClass('empty');
        todoDescription.removeClass('empty');

        // Check if element already exists
        let exists = false;
        for (let i = 0; i < todoItemArray.length; i++) {
            const el = todoItemArray[i];
            if (todoTitleVal === el.title && todoDescriptionVal === el.description) {
                exists = true;
                break;
            }
        }

        // Either adds todo, or show error message that todo is already existing
        if (!exists) {
            addTodo(todoTitle, todoDescription, todoTitleVal, todoDescriptionVal);
        } else {
            addActiveClass($('#double_todo'));
        }
    } else {
        // Shows which fields were empty
        if (todoTitleVal === "" && !todoTitle.hasClass('empty'))
            todoTitle.addClass('empty');

        if (todoDescriptionVal === "" && !todoDescription.hasClass('empty'))
            todoDescription.addClass('empty');
    }
});

/**
 * Adds a todo item to the todoItemsArray and html
 */
function addTodo(todoTitle, todoDescription, todoTitleVal, todoDescriptionVal) {
    // Finds all tags for the new todo
    let todoTagsArray = [];
    $('.tag_title').each(function () {
        todoTagsArray.push(new Tag($(this).html()));
    });

    // Create and add todo to array and html
    let newTodo = new TodoItem(todoTitleVal, todoDescriptionVal, todoTagsArray);
    newTodo.addToItemList();
    todoItemArray.push(newTodo);

    // Reset add todo fields
    todoTitle.val('');
    todoDescription.val('');
    $('.todo_tags_input').val('');
    $('.todo_tags_input_container').html('');
    $('#double_todo').removeClass('active');
}

/**
 * Add tags when pressing a comma
 */
$('#add_todo_form .todo_tags_input').keydown(function (e) {
    if (!e.shiftKey && e.keyCode === 188) {
        // Prevents showing the comma
        e.preventDefault();

        let element = $(this);
        addTag(element, element.val(), element.parent().find('.todo_tags_input_container'));
    }
});

// TODO LIST

/**
 * Handling searching for todos
 */
$('#todo_search').keyup(function () {
    // The String to look for
    let val = $(this).val();

    let itemList = $('#item_list');
    if (val !== '') {
        // Show the todos according to the search field input
        if (!showSearch) showSearch = true;
        let todos = getTodosByTag(val);

        itemList.html('');
        todos.forEach(el => {
            itemList.append(el.getHTML());
        });
    } else if (showSearch) {
        // Show all todos if the search field is empty
        showSearch = false;

        itemList.html('');
        appendTodoItems();
    }
});

/**
 * Returns a list of todo items that have a certain (part of a) tag
 */
function getTodosByTag(tag) {
    // Array to return
    let res = [];

    // Loop through todo items
    for (let i = 0; i < todoItemArray.length; i++) {
        todo = todoItemArray[i];

        // Loop through list of tags
        for (let j = 0; j < todo.tagList.length; j++) {
            todoTag = todo.tagList[j];

            // If a match is found, stop looping and add todo item to res
            if (todoTag.title.indexOf(tag) != -1) {
                res.push(todo);
                break;
            }
        }
    }
    return res;
}

/**
 * Adds a tag when pressing a comma for editing todos
 */
$(document).on('keypress', '.todo_item .todo_edit_field:last-child', function (e) {
    if (e.keyCode === 44) {
        let element = $(this);

        // Prevents showing the comma
        e.preventDefault();
        addTag(element, element.val(), element.parent().parent().find('.todo_tags'));
    }
});

/**
 * Removes a tag from a todo when editing todos
 */
$(document).on('click', '.removable_tag', function () {
    $(this).remove();
});

/**
 * Removes a todo item from the todoItemArray
 */
$(document).on('click', '.remove_todo_item', function () {
    let todoHTML = $(this).parent().parent();


    let index = getTodoIndex(todoHTML.find('.todo_title').html(), todoHTML.find('.todo_description').html());
    todoItemArray.splice(index, 1);

    todoHTML.remove();
});

/**
 * Handle editing todo item
 */
$(document).on('click', '.edit_todo_item', function () {
    // Initialize values
    let todoHTML = $(this).parent().parent();

    let title = todoHTML.find('.todo_title');
    let description = todoHTML.find('.todo_description');

    let addTagsDiv = todoHTML.find('.todo_edit_input_tags');
    let tagDiv = todoHTML.find('.todo_tags');

    if (!todoHTML.hasClass('editing_todo')) {
        changeTodoToEdit($(this), todoHTML, title, description, addTagsDiv, tagDiv);

    } else {
        changeTodoFromEdit($(this), todoHTML, title, description, addTagsDiv, tagDiv);
    }
});

/**
 * Change current todo item from normal to editing
 */
function changeTodoToEdit(thisElement, todoHTML, title, description, addTagsDiv, tagDiv) {
    // Change todo element to edit
    todoHTML.addClass('editing_todo');
    thisElement.html("update");

    // Add input fields 
    title.html('<input data-oldvalue="' + title.html() + '" class="todo_edit_field" type="input" value="' + title.html() + '" placeholder="Type here..." />');
    description.html('<input data-oldvalue="' + description.html() + '" class="todo_edit_field" type="input" value="' + description.html() + '" placeholder="Type here..." />');
    addTagsDiv.html('<input class="todo_edit_field" type="input" placeholder="Type here... (Add tag with a comma)" />');

    // Replace tags with removable tags
    tagDiv.find('.tag_title').each(function () {
        let tagTitle = $(this).html();
        $(this).parent().remove();
        tagDiv.append(getTagHTML(tagTitle, true));
    });
}

/**
 * Change current todo item from editing to normal
 */
function changeTodoFromEdit(thisElement, todoHTML, title, description, addTagsDiv, tagDiv) {
    // Get new values
    let newTitle = title.find('input').val();
    let newDescription = description.find('input').val();

    // Change todo element to normal
    todoHTML.removeClass('editing_todo');
    thisElement.html('edit');

    // Find the current todo item in todoItemArray
    let index = getTodoIndex(title.find("input").data("oldvalue"), description.find("input").data("oldvalue"));
    let todo = todoItemArray[index];

    // Change title of todo item if the input field is not empty
    // Else keep old title
    if (newTitle === '') {
        title.html(title.find("input").data("oldvalue"));
    } else {
        title.html(newTitle);
        todo.title = newTitle;
    }

    // Change description of todo item if the input field is not empty
    // Else keep old description
    if (newDescription === '') {
        description.html(description.find("input").data("oldvalue"));
    } else {
        description.html(newDescription);
        todo.description = newDescription;
    }

    // Clear taglist to add new tags
    todo.tagList = [];

    // Add all tags
    tagDiv.find('.tag_title').each(function () {
        let tagTitle = $(this).html();

        todo.tagList.push(new Tag(tagTitle));

        $(this).parent().remove();
        tagDiv.append(getTagHTML(tagTitle, false));
    });
    addTagsDiv.html('');
}

// SAVE AND LOAD TODOS

/**
 * Load todos button
 */
$('#load_todos').click(loadTodos);

/**
 * Load todos from localStorage and put them in todoItemArray
 */
function loadTodos() {
    // Empty item list html
    $('#item_list').html('');

    // Get todos from current user
    let todos = $('#todo_app').data('user');
    let todosJSON = JSON.parse(window.localStorage.getItem(todos));

    // Add todos from JSON
    if (todosJSON !== null) {
        todoItemArray = [];
        for (let i = 0; i < todosJSON.length; i++) {
            todoItemArray.push(jsonToTodoItem(todosJSON[i]));
        }
        appendTodoItems();
    }
}

/**
 * Save todos button
 */
$('#save_todos').click(saveTodos);

/**
 * Save todoItemArray in localStorage
 */
function saveTodos() {
    let user = $('#todo_app').data('user');

    // Store todoItemArray in JSON format in localStorage
    window.localStorage.setItem(user, JSON.stringify(todoItemArray));
}

