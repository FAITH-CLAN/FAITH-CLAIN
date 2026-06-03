class TicTacToe {
  constructor(playerX, playerO) {
    this.playerX = playerX;
    this.playerO = playerO;
    this.currentTurn = playerX;
    this.turns = 0;
    this.winner = null;
    this.board = Array.from({ length: 9 }, (_, i) => String(i + 1));
  }

  turn(isO, index) {
    const symbol = isO ? 'O' : 'X';
    if (index < 0 || index > 8 || this.board[index] === 'X' || this.board[index] === 'O') {
      return false;
    }
    this.board[index] = symbol;
    this.turns += 1;
    this.currentTurn = isO ? this.playerX : this.playerO;
    return true;
  }

  render() {
    return this.board;
  }
}

module.exports = TicTacToe;
