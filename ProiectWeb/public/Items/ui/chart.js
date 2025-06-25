
function createCanvas(ItemID, chartData) {
    const xValues = chartData.map(entry => getDayAndMonth(entry.added_date));
    const yValues = chartData.map(entry => entry.quantity);

    new Chart(`myChart-${ItemID}`, {
        type: "bar",
        data: {
            labels: xValues,
            datasets: [{
                backgroundColor: "#5AC8FA",
                data: yValues
            }]
        },
        options: {
            legend: { display: false },
            title: {
                display: true,
                text: "Stock 2025"
            }
        }
    });
}

window.createCanvas = createCanvas;