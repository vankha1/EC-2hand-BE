const transactionCost = (numProd: number, price: number): number => {
    if (numProd < 1) return 0;
    if (numProd >= 1 && numProd <= 5) {
        return price * 0.05;
    } else if (numProd > 5 && numProd <= 10) {
        return price * 0.08;
    }

    return price * 0.1;
};

export { transactionCost };
