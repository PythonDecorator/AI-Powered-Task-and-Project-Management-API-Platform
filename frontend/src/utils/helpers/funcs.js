export const formattedCurrency = (amount, curr) => {
    const formatter = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: curr,
    })

    return formatter.format(amount)
}

export const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US').format(number);
};