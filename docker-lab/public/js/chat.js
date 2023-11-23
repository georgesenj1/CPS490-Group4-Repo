const socket = io();

function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const userSelect = document.getElementById('user-select');
    const message = messageInput.value;
    const receiverId = userSelect.value;

    if (message && receiverId) {
        socket.emit('chat message', { senderId: currentUserId, receiverId, message });
        messageInput.value = '';
    }
}

socket.on('chat message', (msg) => {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML += `<p>${msg.senderId}: ${msg.message}</p>`;
});

document.getElementById('send-button').addEventListener('click', sendMessage);
