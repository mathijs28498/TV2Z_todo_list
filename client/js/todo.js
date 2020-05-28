// Ideas:
//  - Edit mode/view mode?

// Make tag class
//  - Only allow numbers, letters, spaces (seperate by commas)
//  - max length tag
class Tag {
    constructor(title) {
        this.title = title;
    }

    getHTML() {
        return '<div class="todo_tag">' + this.title + '</div>'
    }
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
        let resHTML = '<li class="todo_item">';
        resHTML += '<p class="todo_title">' + this.title + '</p>';
        resHTML += '<p class="todo_description">' + this.description + '</p>'

        resHTML += '<div class="todo_tags">';
        this.tagList.forEach(el => {
            resHTML += el.getHTML();
        });

        resHTML += '</div>';

        resHTML += '</li>';

        return resHTML;
    }

    addToItemList() {
        $('#item_list').append(this.getHTML());
    }
}

$(document).ready(() => {
    // let tempItem = new TodoItem("This is a title", "This is a description", []);
    // tempItem.addToItemList();
    // todoItems.push(tempItem);
});


// Handle creating todo items
//  - Handle user input
//  - Handle taglist
$('#add_todo_form').on('submit', function(e) {
    e.preventDefault();

    thisJ = $(this);

    let todoTags = [];
    todoTags.push(new Tag(thisJ.find('#todo_tags_input').val()));
    let newTodo = new TodoItem(
        thisJ.find('#todo_title_input').val(),
        thisJ.find('#todo_description_input').val(),
        todoTags
    );

    newTodo.addToItemList();

    todoItems.push(newTodo);

})

// Handle editing todo items
//  - Edit title/description
//  - Remove/add tags

// Handle searching (Bootstrap?)

// Handle login/sign in

// Handle storing lists
