// search.js

document.addEventListener('DOMContentLoaded', () => {
    const userSearchInput = document.getElementById('userSearch');
    const userListContainer = document.getElementById('userListContainer');

    // Function to update the UI with search results
    function updateSearchResults(users) {
        userListContainer.innerHTML = ''; // Clear previous results

        users.forEach((user) => {
            const userListItem = document.createElement('li');
            userListItem.textContent = user.username; // Update with the actual user property you want to display
            userListContainer.appendChild(userListItem);
        });
    }

    // Function to perform a user search
    function searchUsers() {
        const searchTerm = userSearchInput.value.trim();

        // Make an API request to search for users based on the searchTerm
        // You can use fetch or any other method to make the request

        // Example fetch request:
        fetch(`/search_users?searchTerm=${searchTerm}`)
            .then((response) => response.json())
            .then((data) => {
                updateSearchResults(data); // Update the UI with search results
            })
            .catch((error) => {
                console.error('Error searching users:', error);
            });
    }

    // Event listener for the search button
    const searchButton = document.getElementById('searchButton');
    searchButton.addEventListener('click', searchUsers);
});
