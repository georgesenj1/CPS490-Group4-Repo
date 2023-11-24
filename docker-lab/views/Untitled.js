doctype html
html
  head
    title Chat Page
    link(rel="stylesheet" href="/css/styles.css")

  body
    .container
      h1 Chat Page

      // Section for Group Creation with User List
      section.group-creation
        h2 Create New Group
        form#group-creation-form
          input(type="text" name="groupName" placeholder="Group Name")

          // List of users with checkboxes
          ul.user-checkbox-list
            each user in users
              if user.id != userId  // Do not show the current user
                li
                  label
                    input(type="checkbox" name="members" value=user.id)
                    span= user.id

          button(type="button" onclick="createGroup()") Create Group

      // Section for Group Links
      section.group-links
        h2 Your Groups
        ul#group-links
          // Group links will be populated here

      // ... Rest of the chat page ...

    // Include Socket.io script and custom client-side logic
    script(src="/socket.io/socket.io.js")
    script.
      var socket = io(); 
      var userId = '#{userId}'; // Logged-in user's ID

      // ... existing Socket.io and JavaScript code ...

      function createGroup() {
        var groupName = document.querySelector('#group-creation-form [name="groupName"]').value;
        var checkedBoxes = document.querySelectorAll('#group-creation-form [name="members"]:checked');
        var members = Array.from(checkedBoxes).map(box => box.value);

        fetch('/create-group', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groupName, members })
        })
        .then(response => response.json())
        .then(data => {
            if (data.groupId) {
                var groupLinks = document.getElementById('group-links');
                var linkItem = document.createElement('li');
                var link = document.createElement('a');
                link.href = `/group-chat/${data.groupId}`; // URL to the group chat
                link.textContent = groupName;
                linkItem.appendChild(link);
                groupLinks.appendChild(linkItem);
            }
            // Clear the form or provide feedback
        })
        .catch(error => console.error('Error:', error));
      }
