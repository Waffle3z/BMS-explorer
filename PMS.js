function stringToMatrix(s) {
	const matrix = [];
	const columns = s.match(/\([^)]+\)/g) || [];
	for (const v of columns) {
		const column = v.match(/\d+/g).map(Number);
		matrix.push(column);
	}
	return matrix;
}

function matrixToString(m) {
	let s = "";
	for (let i = 0; i < m.length; i++) {
		s += `(${m[i].join(",")})`;
	}
	return s;
}

// remove rows that are all zero
function matrixReduce(matrix) {
	if (matrix.length == 0 || matrix[0].length <= 1) return matrix;
	let index = matrix[0].length-1;
	for (let i = 0; i < matrix.length; i++) {
		if (matrix[i][index] != 0) {
			return matrix;
		}
	}
	for (let i = 0; i < matrix.length; i++) {
		matrix[i].pop();
	}
	return matrixReduce(matrix);
}

// remove trailing zeros
function matrixSimplify(matrix) {
	return matrix.map(row => {
		let index = row.length - 1;
		while (index > 0 && row[index] === 0) {
			index--;
		}
		return row.slice(0, index + 1);
	});
}

function matrixIsSuccessor(matrix) {
	const lastColumn = matrix[matrix.length - 1];
	if (lastColumn) {
		for (let i = 0; i < lastColumn.length; i++) {
			if (lastColumn[i] !== 0) {
				return false;
			}
		}
		return true;
	}
}

function PMSexpand(matrix, n) {
	const lastColumn = matrix[matrix.length - 1];
	if (!lastColumn) return [];
	let L, Li;
	for (let i = lastColumn.length - 1; i >= 0; i--) {
		if (lastColumn[i] !== 0) {
			L = lastColumn[i];
			Li = i;
			break;
		}
	}
	const newMatrix = matrix.map(row => [...row]);
	if (!L || n == 0) {
		newMatrix.pop();
		return matrixReduce(newMatrix);
	}
	for (let i = Li; i < lastColumn.length; i++) {
		if (newMatrix[newMatrix.length - L - 1][i] !== 0) {
			newMatrix[newMatrix.length - 1][i] = newMatrix[newMatrix.length - L - 1][i] + L;
		} else {
			newMatrix[newMatrix.length - 1][i] = 0;
		}
	}
	const badPart = newMatrix.slice(-L);
	for (let i = 1; i < n; i++) {
		for (let j = 0; j < badPart.length; j++) {
			const column = [...badPart[j]];
			for (let k = 0; k < column.length; k++) {
				if (column[k] > j + 1) {
					column[k] += L * i;
				}
			}
			newMatrix.push(column);
		}
	}
	return matrixReduce(newMatrix);
}

function PMStoAMS(matrix) {
	let newMatrix = [];
	for (let i = 0; i < matrix.length; i++) {
		let newRow = [];
		for (let j = 0; j < matrix[i].length; j++) {
			newRow[j] = matrix[i][j] == 0 ? 0 : i + 1 - matrix[i][j];
		}
		newMatrix[i] = newRow;
	}
	return newMatrix;
}

function AMStoBMS(matrix) {
	let newMatrix = [];
	for (let i = 0; i < matrix.length; i++) {
		let newRow = [];
		for (let j = 0; j < matrix[i].length; j++) {
			let height = 0;
			let index = matrix[i][j];
			while (index > 0) {
				height++;
				index = matrix[index-1][j];
			}
			newRow[j] = height;
		}
		newMatrix[i] = newRow;
	}
	return newMatrix;
}

function PMStoBMS(matrix) {
	return AMStoBMS(PMStoAMS(matrix));
}