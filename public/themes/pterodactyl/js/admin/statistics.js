// Jexactyl Software. (https://jexactyl.com)
// Green: #189a1c
// Gray: hsl(211, 22%, 21%)

console.log(Pterodactyl);

const suspended = Pterodactyl.suspended;
const active = Pterodactyl.servers.length - Pterodactyl.suspended;
const freeDisk = Pterodactyl.diskTotal - Pterodactyl.diskUsed;
const freeMemory = Pterodactyl.memoryTotal - Pterodactyl.memoryUsed;

const diskChart = new Chart($("#disk_chart"), {
    type: "pie",
    data: {
        labels: ["可用存储空间", "已用存储空间"],
        datasets: [{
            backgroundColor: ["#189a1c", "hsl(211, 22%, 21%)"],
            data: [freeDisk, Pterodactyl.diskUsed]
        }]
    }
});

const ramChart = new Chart($("#ram_chart"), {
    type: "pie",
    data: {
        labels: ["可用内存", "已用内存"],
        datasets: [{
            backgroundColor: ["#189a1c", "hsl(211, 22%, 21%)"],
            data: [freeMemory, Pterodactyl.memoryUsed]
        }]
    }
});

const serversChart = new Chart($("#servers_chart"), {
    type: "pie",
    data: {
        labels: ["状态正常的服务器", "已被停用的服务器"],
        datasets: [{
            backgroundColor: ["#189a1c", "hsl(211, 22%, 21%)"],
            data: [active, suspended]
        }]
    }
});

const statusChart = new Chart($("#status_chart"), {
    type: "pie",
    data: {
        labels: ["正在运行的服务器", "处于离线的服务器"],
        datasets: [{
            backgroundColor: ["#189a1c", "hsl(211, 22%, 21%)"],
            data: [0, 0]
        }]
    }
});

const servers = Pterodactyl.servers;
for (let t = 0; t < servers.length; t++) {
    getStatus(servers[t]);
}

function getStatus(t) {
    var a = Pterodactyl.serverstatus[t.uuid].attributes.current_state;
    "running" == a ? statusChart.data.datasets[0].data[0]++ : statusChart.data.datasets[0].data[1]++, statusChart.update();
}
