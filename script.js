document.addEventListener('DOMContentLoaded', () => {
    let teamMembers = ['Cheryl', 'Sam', 'Peter', 'Jurgen'];
    let memberColors = ['#FF5733', '#33FF57', '#3357FF', '#F3FF33']; // Example colors
  
    const spinButton = document.getElementById('spinButton');
    const resetButton = document.getElementById('resetButton');
    const wheel = document.getElementById('wheel'); // Use the existing canvas element.
    wheel.width = 300;
    wheel.height = 300;
    const ctx = wheel.getContext('2d');
    let currentRotation = 0; // This tracks the current rotation angle of the wheel
    let lastRotation = 0;
  
    function getWinningIndex(rotation) {
      const total = teamMembers.length;
      const anglePerSegment = 2 * Math.PI / total;
      // Normalize rotation: ensures the rotation is between 0 and 2 * Math.PI
      const normalizedRotation = (rotation + 2 * Math.PI) % (2 * Math.PI);
      // Find the segment that intersects with the marker (at the top)
      // The wheel's segments were drawn with 0 at the top (i.e., 12 o'clock)
      let winningIndex = Math.floor((Math.PI * 1.5 - normalizedRotation) / anglePerSegment) % total;
      // The index can be negative if the wheel stops close to the 12 o'clock position, just after a full rotation
      // In that case, we add the total number of segments to wrap it around
      if (winningIndex < 0) {
          winningIndex += total;
      }
  
      return winningIndex;
    }
  
    function getWinningSegment(rotation) {
      const winningIndex = getWinningIndex(rotation);
      // Return the name of the winning team member
      return teamMembers[winningIndex];
    }
  
    function drawWheel(rotation = 0) {
      const total = teamMembers.length;
      const angle = 2 * Math.PI / total;
      const radius = wheel.width / 2;
      ctx.clearRect(0, 0, wheel.width, wheel.height); // Clear the canvas
  
      ctx.font = '20px Arial';
      ctx.fillStyle = 'black';
  
      teamMembers.forEach((member, index) => {
        const startAngle = angle * index + rotation;
        const endAngle = angle * (index + 1) + rotation;
  
        // Draw segment
        ctx.beginPath();
        ctx.moveTo(radius, radius);
        ctx.arc(radius, radius, radius, startAngle, endAngle);
        ctx.fillStyle = memberColors[index];
        ctx.fill();
  
        // Add text
        const textAngle = startAngle + angle / 2;
        ctx.save();
        ctx.translate(radius, radius);
        ctx.rotate(textAngle);
        ctx.textAlign = "right";
        ctx.fillStyle = "#000";
        ctx.fillText(member, radius - 10, 0);
        ctx.restore();
      });
    }
  
    function spinWheel() {
      let startTimestamp;
      const spinDuration = 5000; // Duration in milliseconds
      const spinAngleStart = Math.random() * 10 + 10; // Random start speed
  
      function rotateWheel(timestamp) {
        if (!startTimestamp) startTimestamp = timestamp;
        const runtime = timestamp - startTimestamp;
        const progress = Math.min(runtime / spinDuration, 1);
        const spinIncrement = spinAngleStart * (1 - progress) * (Math.PI / 180); // Smooth deceleration
  
        currentRotation += spinIncrement; // Add consistent rotation direction
        currentRotation %= (2 * Math.PI); // Ensure it stays within a full circle
  
        drawWheel(currentRotation);
  
        if (runtime < spinDuration) {
          requestAnimationFrame(rotateWheel);
        } else {
          lastRotation = currentRotation; // Save the last rotation
          // Move the re-enable logic and call to highlightWinner here to ensure it always executes
          spinButton.disabled = false;
          resetButton.style.display = 'block';
          highlightWinner(lastRotation); // Make sure this is after re-enabling the button
        }
      }
  
      requestAnimationFrame(rotateWheel);
      spinButton.disabled = true;
    }
  
    function resetAndRemoveLastWinner() {
      const winner = getWinningSegment(lastRotation);
      const winnerIndex = teamMembers.indexOf(winner);
  
      if (winnerIndex !== -1) {
        teamMembers.splice(winnerIndex, 1); // Remove the winning member
        memberColors.splice(winnerIndex, 1); // Also remove the corresponding color
      }
  
      if (teamMembers.length > 0) {
        drawWheel(); // Redraw the wheel without the removed member
      } else {
        alert("All team members have had their turn!");
        // Optionally reset the game here
      }
  
      resetButton.style.display = 'none';
    }
  
    function highlightWinner(rotation) {
      const winner = getWinningSegment(rotation);
  
      console.log("Winner is: " + winner);
      const winnerIndex = teamMembers.indexOf(winner);
      console.log("Winner index is: " + winnerIndex);
  
      if (winner === 'Jurgen') {
        triggerConfetti();
      }
    }
  
    function triggerConfetti() {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  
    drawWheel(); // Initial draw
  
    spinButton.addEventListener('click', spinWheel);
    resetButton.addEventListener('click', resetAndRemoveLastWinner);
  });
  