window.onload = function () {
    const puzzleArea = document.getElementById("puzzlearea");
    const tiles = puzzleArea.getElementsByClassName("tile");
    const select = document.getElementById("img-select");
    const shuffleBtn = document.getElementById("shuffler");

    const gamestats = document.getElementById("game-stats");
    const winMessage = document.getElementById("win-message");
    const restartButton = document.getElementById("restart");

    const bgm = document.getElementById('bgm');
    bgm.volume = 0.4;

    const gong = document.getElementById('gong');
    gong.volume = 0.2;
    
    // New variables for user tracking and preferences
    let currentUserId = null;
    let userPreferences = {
        soundEnabled: true,
        animationsEnabled: true,
        defaultPuzzleSize: '4x4',
        preferredBackground: 'sonic.png'
    };

    let moveCount = 0;
    let startTime;
    let gameTimer;

    let emptyX = 3;
    let emptyY = 3;

    // initializing
    function initializeTiles(imagePath) {
        moveCount = 0;
        startTime = Date.now();
        clearInterval(gameTimer);

        gamestats.style.display = "block";
        gameTimer = setInterval(updateTimer, 1000);
        updateTimer();
        document.getElementById("move-display").textContent = moveCount;

        for (let i = 0; i < tiles.length; i++) {
            const correctX = i % 4;
            const correctY = Math.floor(i / 4);

            tiles[i].dataset.correctX = correctX;
            tiles[i].dataset.correctY = correctY;
            tiles[i].style.backgroundImage = `url(${imagePath})`;
            tiles[i].style.backgroundPosition = `-${correctX * 100}px -${correctY * 100}px`;
            tiles[i].dataset.x = correctX;
            tiles[i].dataset.y = correctY;
            tiles[i].style.gridColumnStart = correctX + 1;
            tiles[i].style.gridRowStart = correctY + 1;

            // clicker
            tiles[i].onclick = function () {
                const x = parseInt(this.dataset.x);
                const y = parseInt(this.dataset.y);
                if (isMovable(x, y)) {
                    moveTile(this, x, y);
                }
            };

            //for hovering
            tiles[i].onmouseover = function () {
                const x = parseInt(this.dataset.x);
                const y = parseInt(this.dataset.y);
                if (isMovable(x, y)) {
                    this.classList.add("movablepiece");
                }
            };

            tiles[i].onmouseout = function () {
                this.classList.remove("movablepiece");
            };
        }

        emptyX = 3;
        emptyY = 3;
    }

    function showWinAnimation() {
        if (!userPreferences.animationsEnabled) return;

        const container = document.createElement("div");
        container.id = "winAnimation";
        container.className = "win-container";

        const text = document.createElement("h1");
        text.className = "win-text";
        text.textContent = "You Win!";
        container.appendChild(text);
        document.body.appendChild(container);

        // Original confetti pattern maintained
        createSimpleConfetti(container, 0);
        createSimpleConfetti(container, 50);
        createSimpleConfetti(container, 100);
        createSimpleConfetti(container, 700);
        createSimpleConfetti(container, 850);
        createSimpleConfetti(container, 1000);
        createSimpleConfetti(container, 1000);
        createSimpleConfetti(container, 1200);
        createSimpleConfetti(container, 1250);
        createSimpleConfetti(container, 0);
        createSimpleConfetti(container, 75);
        createSimpleConfetti(container, 35);
        createSimpleConfetti(container, 700);
        createSimpleConfetti(container, 850);
        createSimpleConfetti(container, 1000);
        createSimpleConfetti(container, 1000);
        createSimpleConfetti(container, 1200);
        createSimpleConfetti(container, 0);
        createSimpleConfetti(container, 300);
        createSimpleConfetti(container, 150);
        createSimpleConfetti(container, 700);
        createSimpleConfetti(container, 850);
        createSimpleConfetti(container, 1000);
        createSimpleConfetti(container, 1000);
        createSimpleConfetti(container, 1200);
        createSimpleConfetti(container, 1250);
        createSimpleConfetti(container, 1250);

        createSimpleConfetti(container, 1350);
        createSimpleConfetti(container, 1350);
        createSimpleConfetti(container, 1500);
        createSimpleConfetti(container, 1500);
        createSimpleConfetti(container, 1550);
        createSimpleConfetti(container, 1575);
        createSimpleConfetti(container, 1700);
        createSimpleConfetti(container, 1850);
        createSimpleConfetti(container, 1800);
        createSimpleConfetti(container, 1600);
        createSimpleConfetti(container, 1500);

        createSimpleConfetti(container, 1900);
        createSimpleConfetti(container, 1900);
        createSimpleConfetti(container, 2100);
        createSimpleConfetti(container, 2100);
        createSimpleConfetti(container, 2200);
        createSimpleConfetti(container, 2400);

        createSimpleConfetti(container, 2500);
        createSimpleConfetti(container, 2500);
        createSimpleConfetti(container, 2500);
        createSimpleConfetti(container, 2550);
        createSimpleConfetti(container, 2600);
        createSimpleConfetti(container, 2650);

        setTimeout(() => {
            container.remove();
        }, 5000);
    }

    function createSimpleConfetti(container, delay) {
        setTimeout(() => {
            const confetti = document.createElement("div");
            confetti.className = "confetti";
            confetti.style.backgroundColor = getRandomColor();
            confetti.style.left = Math.random() * 80 + 10 + "vw";
            confetti.style.top = "-30px";
            container.appendChild(confetti);

            //falling animation
            const animation = confetti.animate([
                { top: "-30px", opacity: 0 },
                { top: "30px", opacity: 0.8 },
                { top: "100vh", opacity: 0 }
            ], {
                duration: 2000,
                easing: "cubic-bezier(0.4, 0, 0.6, 1)"
            });

            animation.onfinish = () => confetti.remove();
        }, delay);
    }

    function getRandomColor() {
        const colors = ["#FF5252", "#FFEB3B", "#4CAF50", "#2196F3", "#9C27B0"];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function isMovable(x, y) {
        return (
            (x === emptyX && Math.abs(y - emptyY) === 1) ||
            (y === emptyY && Math.abs(x - emptyX) === 1)
        );
    }

    function moveTile(tile, x, y) {
        tile.style.gridColumnStart = emptyX + 1;
        tile.style.gridRowStart = emptyY + 1;

        // move increments everytime
        moveCount++;
        document.getElementById("move-display").textContent = moveCount;

        // Update logical position for this tile
        tile.dataset.x = emptyX;
        tile.dataset.y = emptyY;

        // Update empty location
        emptyX = x;
        emptyY = y;

        checkWin();
    }

    function shuffleBoard() {
        const originalCheckWin = checkWin;
        checkWin = function () { return false; };

        for (let i = 0; i < 300; i++) {
            const neighbors = [];
            for (let j = 0; j < tiles.length; j++) {
                const x = parseInt(tiles[j].getAttribute("data-x"));
                const y = parseInt(tiles[j].getAttribute("data-y"));
                if (isMovable(x, y)) {
                    neighbors.push(tiles[j]);
                }
            }
            const rand = Math.floor(Math.random() * neighbors.length);
            const tile = neighbors[rand];
            const x = parseInt(tile.getAttribute("data-x"));
            const y = parseInt(tile.getAttribute("data-y"));
            moveTile(tile, x, y);
        }

        checkWin = originalCheckWin;

        moveCount = 0;
        document.getElementById("move-display").textContent = moveCount;
        startTime = Date.now();
        updateTimer();

        // Play music if enabled
        if (userPreferences.soundEnabled) {
            gong.pause();
            gong.currentTime = 0;
            bgm.currentTime = 0;
            bgm.play();
        }
    }

    function updateTimer() {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, "0");
        const seconds = (elapsed % 60).toString().padStart(2, "0");
        document.getElementById("time-display").textContent = `${minutes}:${seconds}`;
    }

    function checkWin() {
        for (let tile of tiles) {
            const currentX = parseInt(tile.dataset.x);
            const currentY = parseInt(tile.dataset.y);
            const correctX = parseInt(tile.dataset.correctX);
            const correctY = parseInt(tile.dataset.correctY);

            if (currentX !== correctX || currentY !== correctY) {
                return false;
            }
        }
        clearInterval(gameTimer);

        // Calculate time taken for stats
        const elapsed = Math.floor((Date.now() - startTime) / 1000);

        // Save game stats if user is logged in
        if (currentUserId) {
            const gameData = {
                user_id: currentUserId,
                puzzle_size: '4x4',
                time_taken: elapsed,
                moves_count: moveCount,
                bg_image_id: select.value,
                win_status: true
            };

            fetch('save_state.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(gameData)
            }).catch(error => console.error('Error saving stats:', error));
        }

        // Handle sounds based on preferences
        if (userPreferences.soundEnabled) {
            bgm.pause();
            bgm.currentTime = 0;
            gong.currentTime = 0;
            gong.play();
        }

        document.getElementById("win-time").textContent = document.getElementById("time-display").textContent;
        document.getElementById("win-moves").textContent = moveCount;
        puzzleArea.classList.add("hidden");
        gamestats.style.display = "none";
        shuffleBtn.style.display = "none";
        
        // Show animation if enabled
        if (userPreferences.animationsEnabled) {
            showWinAnimation();
        }
        
        winMessage.style.display = "block";
        
        return true;
    }

    restartButton.addEventListener("click", function () {
        // Hide win message
        winMessage.style.display = "none";

        //sound effects reseter 
        if (userPreferences.soundEnabled) {
            bgm.pause();
            bgm.currentTime = 0;
            gong.pause();
            gong.currentTime = 0;
        }

        // shuffler
        shuffleBtn.style.display = "inline-block";

        // Show puzzle
        puzzleArea.classList.remove("hidden");

        // Re-initialize the game
        initializeTiles(select.value);
    });

    // Change image on selection
    select.addEventListener("change", function () {
        initializeTiles(this.value);
    });

    // Shuffle button
    shuffleBtn.addEventListener("click", function () {
        shuffleBoard();
    });

    // Handle registration form submission
    document.getElementById('register-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        fetch('save_state.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            const messageDiv = document.getElementById('registration-message');
            messageDiv.textContent = data.message || data.error;
            messageDiv.style.color = data.success ? 'green' : 'red';
            
            if (data.success) {
                currentUserId = data.user_id;
                // Load user preferences after registration
                fetch('get_preferences.php?user_id=' + currentUserId)
                    .then(response => response.json())
                    .then(prefData => {
                        if (prefData.success) {
                            userPreferences = prefData.preferences;
                            // Apply preferences
                            bgm.volume = userPreferences.soundEnabled ? 0.4 : 0;
                            select.value = userPreferences.preferredBackground;
                        }
                    });
                this.reset();
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    // initialize with image selected
    initializeTiles(select.value);
};