doctype html
html
  head
    title Chat Page
    link(rel="stylesheet" href="/css/styles.css")

  body
    .container
      h1 Chat Page

      ul
        each user in users
          if user.id != userId 
            li
              a(href=`/chat/${user.id}`)= user.id
      
      // Section for Group Creation with User List
      section.group-creation
        h2 Create New Group
        form#group-creation-form
          input(type="text" name="groupName" placeholder="Group Name")

          // List of users with checkboxes
          ul.user-checkbox-list
            each user in users
              if user.id != userId 
                li
                  label
                    input(type="checkbox" name="members" value=user.id)
                    span= user.id

          button(type="button" onclick="createGroup()") Create Group

      // Section for displaying group chat links
      section.group-chats
        h2 Your Group Chats
        ul#group-chat-links
          each group in groups
            li
              a(href=`/group-chat/${group._id}`)= group.name

      // Section for Public Messages
      section.public-messages
        h2 Global Messages
        ul#public-chat-messages
          // Public messages will be populated here

        form#public-chat-form(action="#" method="post")
          input(type="text" id="public-message-input" placeholder="Type a public message")
          button(type="submit") Send

      // Navigation Button
      footer.navigation
        button.button(onclick="location.href='/protected_page'") Back to Protected Page

    // Include Socket.io script and custom client-side logic
    script(src="/socket.io/socket.io.js")
    script.
      var socket = io(); 
      var userId = '#{userId}'; 

      function createGroup() {
        / method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupName, members })
    })
    .then(response => response.json())
    .then(data => {
        if (data.groupId) {
            var groupLinks = document.getElementById('group-links');
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

      // Fetch and display public chat history
      function fetchAndDisplayPublicChatHistory() {
        fetch('/get-public-messages')
            .then(response => response.json())
            .then(messages => {
                messages.forEach(message => displayPublicMessage(message.sender, message.message));
            });
      }

      // Function to display a public chat message
      function displayPublicMessage(sender, message) {
        var publicChatMessages = document.getElementById('public-chat-messages');
        var messageItem = document.createElement('li');
        messageItem.textContent = sender + ": " + message;
        publicChatMessages.appendChild(messageItem);
      }

      fetchAndDisplayPublicChatHistory();

      // Handle public chat form submission
      document.getElementById('public-chat-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var messageText = document.getElementById('public-message-input').value.trim();
        if (messageText) {
            socket.emit('chatMessage', { senderUserId: userId, text: messageText, public: true });
            displayPublicMessage('You', messageText);
            document.getElementById('public-message-input').value = '';
        }
      });

      // Handle incoming public chat messages from the server
      socket.on('publicMessage', function (message) {
        displayPublicMessage(message.sender, message.message);
      });
