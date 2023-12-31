doctype html
html
  head
    title Chat Page
    link(rel="stylesheet" href="/css/styles.css")
    script(src="/socket.io/socket.io.js")
    script(src='https://unpkg.com/emoji-picker-element@latest' type='module')

  body
    .container.main-box
      h1 Chat Page

      // Search Form (Inside the .main-box)
      form(action="/search" method="get")
        input(type="text" name="query" placeholder="Search Users")
        button(type="submit") Search

      // Container for the four boxes
      .chat-boxes-container
        // One-on-One Chats Box
        .chat-box
          h2 One-on-One Chats
          ul
            each user in users
              if user.id != userId 
                li
                  a(href=`/chat/${user.id}`)= user.id

        // Group Chat Links Box
        .chat-box
          h2 Group Chat Links
          ul#group-chat-links
            each group in groups
              li
                a(href=`/group-chat/${group._id}`)= group.name

        // Create New Group Box
        .chat-box
          h2 Create New Group
          form#group-creation-form
            input(type="text" name="groupName" placeholder="Group Name")

            // List of users with checkboxes for group creation
            ul.user-checkbox-list
              each user in users
                if user.id != userId 
                  li
                    label
                      input(type="checkbox" name="members" value=user.id)
                      span= user.id

            button(type="button" onclick="createGroup()") Create Group

        // Public Messages Box
        .chat-box
          h2 Public Messages
          ul#public-chat-messages
            // Public messages will be populated here

          .emoji-picker-container
            button#emoji-button Emoji
            emoji-picker#emoji-picker(style='position: absolute; bottom: 20px; left: 20px; z-index: 1000; display: none;')

          form#public-chat-form(action="#" method="post")
            input(type="text" id="public-message-input" placeholder="Type a public message")
            button(type="submit") Send

      // Navigation Button
      footer.navigation
        button.button(onclick="location.href='/protected_page'") Back to Protected Page

      //- Bubbles for aesthetics
      .bubble(style="width:100px; height:100px; left:10%; animation-duration:4s;")
      .bubble(style="width:60px; height:60px; left:20%; animation-duration:5s;")
      .bubble(style="width:120px; height:120px; left:70%; animation-duration:6s;")

    // Socket.io and Client-Side Logic
    script.
      document.getElementById('emoji-button').addEventListener('click', function() {
        var emojiPicker = document.getElementById('emoji-picker');
        if (emojiPicker.style.display === 'none') {
          emojiPicker.style.display = 'block';
        } else {
          emojiPicker.style.display = 'none';
        }
      });
      var socket = io(); 
      var userId = !{JSON.stringify(userId)}; // Ensure userId is properly encoded as JSON

      function createGroup() {
        var groupName = document.querySelector('#group-creation-form [name="groupName"]').value;
        var checkedBoxes = document.querySelectorAll('#group-creation-form [name="members"]:checked');
        var members = Array.from(checkedBoxes).map(box => box.value);
        members.push(userId); // Include the user who is creating the group
        fetch('/create-group', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ groupName, members })
        })
        .then(response => response.json())
        .then(data => {
          if (data.groupId) {
            var groupLinks = document.getElementById('group-chat-links');
            var linkItem = document.createElement('li');
            var link = document.createElement('a');
            link.href = `/group-chat/${data.groupId}`; 
            link.textContent = groupName;
            linkItem.appendChild(link);
            groupLinks.appendChild(linkItem);
          }
        })
        .catch(error => console.error('Error:', error));
      }

      function fetchAndDisplayPublicChatHistory() {
        fetch('/get-public-messages')
          .then(response => response.json())
          .then(messages => {
            messages.forEach(message => displayPublicMessage(message.sender, message.message));
          });
      }

      function displayPublicMessage(sender, message) {
        var publicChatMessages = document.getElementById('public-chat-messages');
        var messageItem = document.createElement('li');
        messageItem.textContent = sender + ": " + message;
        publicChatMessages.appendChild(messageItem);
      }

      fetchAndDisplayPublicChatHistory();

      document.getElementById('public-chat-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var messageText = document.getElementById('public-message-input').value.trim();
        if (messageText) {
          socket.emit('chatMessage', { senderUserId: userId, text: messageText, isPublic: true });
          
          document.getElementById('public-message-input').value = '';
        }
      });

      socket.on('publicMessage', function (message) {
        displayPublicMessage(message.sender, message.message);
      });

      document.addEventListener('DOMContentLoaded', () => {
        const emojiPicker = document.querySelector('#emoji-picker');
        emojiPicker.addEventListener('emoji-click', event => {
          document.getElementById('public-message-input').value += event.detail.emoji.unicode;
        });
      });

