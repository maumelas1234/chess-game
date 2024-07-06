document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const initialPosition = [
        ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
        ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
        ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
    ];

    let selectedCell = null;
    let turn = 'white';

    function createBoard() {
        board.innerHTML = '';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.classList.add((row + col) % 2 === 0 ? 'white' : 'black');
                cell.dataset.row = row;
                cell.dataset.col = col;
                const piece = initialPosition[row][col];
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.classList.add('piece');
                    pieceElement.classList.add(row < 2 ? 'black' : 'white');
                    pieceElement.textContent = piece;
                    cell.appendChild(pieceElement);
                }
                cell.addEventListener('click', () => handleCellClick(cell));
                board.appendChild(cell);
            }
        }
    }

    function handleCellClick(cell) {
        if (selectedCell) {
            if (isValidMove(selectedCell, cell)) {
                movePiece(selectedCell, cell);
                selectedCell.classList.remove('selected');
                selectedCell = null;
                if (isCheck(turn === 'white' ? 'black' : 'white')) {
                    alert(turn + ' wins by checkmate!');
                    createBoard();
                } else {
                    highlightKingInCheck(turn === 'white' ? 'black' : 'white');
                    turn = turn === 'white' ? 'black' : 'white';
                }
            } else {
                selectedCell.classList.remove('selected');
                selectedCell = null;
            }
        } else {
            const piece = cell.querySelector('.piece');
            if (piece && piece.classList.contains(turn)) {
                selectedCell = cell;
                selectedCell.classList.add('selected');
            }
        }
    }

    function isValidMove(fromCell, toCell) {
        const fromPiece = fromCell.querySelector('.piece');
        const toPiece = toCell.querySelector('.piece');
        const fromRow = parseInt(fromCell.dataset.row);
        const fromCol = parseInt(fromCell.dataset.col);
        const toRow = parseInt(toCell.dataset.row);
        const toCol = parseInt(toCell.dataset.col);
        const pieceType = fromPiece.textContent;

        if (toPiece && toPiece.classList.contains(turn)) {
            return false;
        }

        let valid = false;
        switch (pieceType) {
            case '♙':
                valid = isValidPawnMove(fromRow, fromCol, toRow, toCol, fromPiece, toPiece);
                break;
            case '♟':
                valid = isValidPawnMove(fromRow, fromCol, toRow, toCol, fromPiece, toPiece, true);
                break;
            case '♜':
            case '♖':
                valid = isValidRookMove(fromRow, fromCol, toRow, toCol);
                break;
            case '♞':
            case '♘':
                valid = isValidKnightMove(fromRow, fromCol, toRow, toCol);
                break;
            case '♝':
            case '♗':
                valid = isValidBishopMove(fromRow, fromCol, toRow, toCol);
                break;
            case '♛':
            case '♕':
                valid = isValidQueenMove(fromRow, fromCol, toRow, toCol);
                break;
            case '♚':
            case '♔':
                valid = isValidKingMove(fromRow, fromCol, toRow, toCol);
                break;
        }

        if (valid) {
            const backup = board.innerHTML;
            movePiece(fromCell, toCell);
            if (isCheck(turn)) {
                board.innerHTML = backup;
                return false;
            }
        }

        return valid;
    }

    function isValidPawnMove(fromRow, fromCol, toRow, toCol, fromPiece, toPiece, isBlack = false) {
        const direction = isBlack ? 1 : -1;
        if (fromCol === toCol && !toPiece) {
            if (toRow === fromRow + direction) {
                return true;
            }
            if ((isBlack && fromRow === 1 || !isBlack && fromRow === 6) && toRow === fromRow + 2 * direction) {
                return true;
            }
        } else if (Math.abs(toCol - fromCol) === 1 && toRow === fromRow + direction && toPiece) {
            return true;
        }
        return false;
    }

    function isValidRookMove(fromRow, fromCol, toRow, toCol) {
        if (fromRow !== toRow && fromCol !== toCol) return false;
        const [start, end] = fromRow === toRow ? [fromCol, toCol] : [fromRow, toRow];
        const [constant, varying] = fromRow === toRow ? [fromRow, fromCol] : [fromCol, fromRow];
        for (let i = Math.min(start, end) + 1; i < Math.max(start, end); i++) {
            const cell = document.querySelector(`.cell[data-row="${fromRow === toRow ? constant : i}"][data-col="${fromRow === toRow ? i : constant}"]`);
            if (cell.querySelector('.piece')) return false;
        }
        return true;
    }

    function isValidKnightMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    }

    function isValidBishopMove(fromRow, fromCol, toRow, toCol) {
        if (Math.abs(fromRow - toRow) !== Math.abs(fromCol - toCol)) return false;
        const rowDirection = fromRow < toRow ? 1 : -1;
        const colDirection = fromCol < toCol ? 1 : -1;
        let row = fromRow + rowDirection;
        let col = fromCol + colDirection;
        while (row !== toRow && col !== toCol) {
            const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
            if (cell.querySelector('.piece')) return false;
            row += rowDirection;
            col += colDirection;
        }
        return true;
    }

    function isValidQueenMove(fromRow, fromCol, toRow, toCol) {
        return isValidRookMove(fromRow, fromCol, toRow, toCol) || isValidBishopMove(fromRow, fromCol, toRow, toCol);
    }

    function isValidKingMove(fromRow, fromCol, toRow, toCol) {
        return Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1;
    }

    function movePiece(fromCell, toCell) {
        const fromPiece = fromCell.querySelector('.piece');
        if (fromPiece && (fromCell !== toCell)) {
            const toPiece = toCell.querySelector('.piece');
            if (toPiece) {
                toCell.removeChild(toPiece);
            }
            toCell.appendChild(fromPiece);
        }
    }

    function isCheck(turn) {
        const king = findKing(turn);
        return isCellUnderAttack(king, turn);
    }

    function findKing(turn) {
        const kingSymbol = turn === 'white' ? '♔' : '♚';
        return [...document.querySelectorAll('.piece')]
            .find(piece => piece.textContent === kingSymbol)
            .parentElement;
    }

    function isCellUnderAttack(cell, turn) {
        const opposingPieces = [...document.querySelectorAll(`.piece.${turn === 'white' ? 'black' : 'white'}`)];
        return opposingPieces.some(piece => {
            const fromCell = piece.parentElement;
            return isValidMoveWithoutKingCheck(fromCell, cell);
        });
    }

    function isValidMoveWithoutKingCheck(fromCell, toCell) {
        const fromPiece = fromCell.querySelector('.piece');
        const toPiece = toCell.querySelector('.piece');
        const fromRow = parseInt(fromCell.dataset.row);
        const fromCol = parseInt(fromCell.dataset.col);
        const toRow = parseInt(toCell.dataset.row);
        const toCol = parseInt(toCell.dataset.col);
        const pieceType = fromPiece.textContent;

        switch (pieceType) {
            case '♙':
                return isValidPawnMove(fromRow, fromCol, toRow, toCol, fromPiece, toPiece);
            case '♟':
                return isValidPawnMove(fromRow, fromCol, toRow, toCol, fromPiece, toPiece, true);
            case '♜':
            case '♖':
                return isValidRookMove(fromRow, fromCol, toRow, toCol);
            case '♞':
            case '♘':
                return isValidKnightMove(fromRow, fromCol, toRow, toCol);
            case '♝':
            case '♗':
                return isValidBishopMove(fromRow, fromCol, toRow, toCol);
            case '♛':
            case '♕':
                return isValidQueenMove(fromRow, fromCol, toRow, toCol);
            case '♚':
            case '♔':
                return isValidKingMove(fromRow, fromCol, toRow, toCol);
            default:
                return false;
        }
    }

    function highlightKingInCheck(turn) {
        document.querySelectorAll('.piece').forEach(piece => piece.classList.remove('check'));
        if (isCheck(turn)) {
            const king = findKing(turn);
            king.querySelector('.piece').classList.add('check');
        }
    }

    createBoard();
});