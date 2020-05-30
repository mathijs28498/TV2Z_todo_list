// Ideas:
//  - Edit mode/view mode?

// Make tag class
//  - Only allow numbers, letters, spaces (seperate by commas)
//  - max length tag
class Tag {
    constructor(title) {
        this.title = title;
    }

    getHTML(isRemovable) {
        return getTagHTML(this.title, isRemovable);
    }
}

function getTagHTML(title, isRemovable) {
    return '<div class="todo_tag' + (isRemovable ? ' removable_tag' : '')
        + '"><span class="tag_title">' + title + '</span>'
        + (isRemovable ? '<span class="remove_tag">x</span>' : '') + '</div>'
}

// Make list of all tags
//  - Search through all tags
let allTags = [];

// Make todoitem list
let todoItems = [];

// Make TodoItem class (Unique id?)
class TodoItem {
    constructor(title, description, tagList) {
        this.title = title;
        this.description = description;
        this.tagList = tagList;
    }

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

    addToItemList() {
        if (!showSearch) {
            $('#item_list').append(this.getHTML());
        }
    }
}


$('#log_out').click(function () {
    $('#log_in').removeClass('is_logged_in');

    $('#item_list').html('');
    itemList = [];
    showSearch = false;

    $(this).parent().removeClass('is_logged_in');
});

let logInDetails = [
    ['user', 'pass'],
    ['admin', 'admin'],
    ['Please', 'let me in']
];

$('#log_in_form').on('submit', function (e) {
    e.preventDefault();

    let user = $(this).find('#username');
    let pass = $(this).find('#password');

    let canLogIn = false;
    logInDetails.forEach(el => {
        if (user.val() === el[0] && pass.val() === el[1]) {
            canLogIn = true;
        }
    });

    if (canLogIn) {
        $(this).parent().addClass('is_logged_in');
        $('#todo_app').addClass('is_logged_in');
    }

    user.val('');
    pass.val('');
})

// Handle creating todo items
$('#add_todo_form').on('submit', function (e) {
    e.preventDefault();

    thisJ = $(this);

    let todoTitle = $(this).find('.todo_title_input');
    let todoDescription = $(this).find('.todo_description_input');

    if (todoTitle.val() !== "" && todoDescription.val() !== "") {

        let todoTagsArray = [];
        $(this).find('.tag_title').each(function () {
            todoTagsArray.push(new Tag($(this).html()));
        });

        let newTodo = new TodoItem(
            todoTitle.val(),
            todoDescription.val(),
            todoTagsArray
        );

        todoTitle.val('');
        todoDescription.val('');
        $(this).find('.todo_tags_input').val('');
        $(this).find('.todo_tags_input_container').html('');

        newTodo.addToItemList();
        todoItems.push(newTodo);
    }
});



$('#add_todo_form .todo_tags_input').keydown(function (e) {
    if (!e.shiftKey && e.keyCode === 188) {
        let element = $(this);
        addTag(element, element.val(), element.parent().find('.todo_tags_input_container'), e);
    }
});

let showSearch = false;

$('#todo_search').keyup(function () {
    let val = $(this).val();
    let itemList = $('#item_list');
    if (val !== '') {
        if (!showSearch) showSearch = true;
        let todos = getTodosByTag(val);

        itemList.html('');
        todos.forEach(el => {
            itemList.append(el.getHTML());
        });
    } else if (showSearch) {
        showSearch = false;

        itemList.html('');
        todoItems.forEach(el => {
            itemList.append(el.getHTML());
        });
    }
})

function addTag(element, value, tagDiv, event) {
    if (value !== '') {
        tagDiv.append(getTagHTML(value, true));
    }
    element.val("");
    event.preventDefault();
}

let document$ = $(document);

document$.on('keypress', '.todo_item .todo_edit_field:last-child', function (e) {
    if (e.keyCode === 44) {
        let element = $(this);
        addTag(element, element.val(), element.parent().parent().find('.todo_tags'), e)
    }
})

document$.on('click', '.removable_tag', function () {
    $(this).remove();
});

document$.on('click', '.remove_todo_item', function () {
    let todoHTML = $(this).parent().parent();

    let index = getTodoIndex(todoHTML.find('.todo_title').html(), todoHTML.find('.todo_description').html());
    todoItems.splice(index, 1);

    todoHTML.remove();
});

function getTodoIndex(title, description) {
    for (let i = 0; i < todoItems.length; i++) {
        if (todoItems[i].title === title
            && todoItems[i].description === description) {
            return i;
        }
    }

    return -1;
}

function getTodosByTag(tag) {
    let res = [];
    for (let i = 0; i < todoItems.length; i++) {
        todo = todoItems[i];
        for (let j = 0; j < todo.tagList.length; j++) {
            todoTag = todo.tagList[j];
            if (todoTag.title.indexOf(tag) != -1) {
                console.table(todoTag);
                res.push(todo);
                break;
            }
        }
    }

    return res;
}



document$.on('click', '.edit_todo_item', function () {
    let todoHTML = $(this).parent().parent();

    let title = todoHTML.find('.todo_title');
    let description = todoHTML.find('.todo_description');


    let addTagsDiv = todoHTML.find('.todo_edit_input_tags');
    let tagDiv = todoHTML.find('.todo_tags');

    if (!todoHTML.hasClass('editing_todo')) {
        todoHTML.addClass('editing_todo');
        $(this).html("update");

        title.html('<input data-oldvalue="' + title.html() + '" class="todo_edit_field" type="input" value="' + title.html() + '" placeholder="Type here..." />');
        description.html('<input data-oldvalue="' + description.html() + '" class="todo_edit_field" type="input" value="' + description.html() + '" placeholder="Type here..." />');

        addTagsDiv.html('<input class="todo_edit_field" type="input" placeholder="Type here..." />');

        tagDiv.find('.tag_title').each(function () {
            let tagTitle = $(this).html();
            $(this).parent().remove();
            tagDiv.append(getTagHTML(tagTitle, true));
        });

    } else {
        let newTitle = title.find('input').val();
        let newDescription = description.find('input').val();

        if (newTitle !== '' && newDescription !== '') {
            todoHTML.removeClass('editing_todo');
            $(this).html('edit');

            let index = getTodoIndex(title.find("input").data("oldvalue"), description.find("input").data("oldvalue"));
            let todo = todoItems[index];
            todo.title = newTitle;
            todo.description = newDescription;
            todo.tagList = [];

            title.html(newTitle);
            description.html(newDescription);

            addTagsDiv.html('');

            tagDiv.find('.tag_title').each(function () {
                let tagTitle = $(this).html();

                todo.tagList.push(new Tag(tagTitle));

                $(this).parent().remove();
                tagDiv.append(getTagHTML(tagTitle, false));
            });
        }
    }
});

// Handle editing todo items
//  - Edit title/description
//  - Remove/add tags

// Handle searching (Bootstrap?)

// Handle login/sign in

// Handle storing lists
