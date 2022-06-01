function getChart() {
  $.ajax({
    url: "/admin/getChartData",
    method: "get",
    success: async (chartDatas) => {
      console.log(chartDatas);
      const ctx = document.getElementById("myChart").getContext("2d");
      const myChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: chartDatas.date,
          datasets: [
            {
              label: "daily Sales Report",
              data: chartDatas.dailyAmt,
              backgroundColor: [
                "rgba(255, 99, 132, 0.2)",
                "rgba(54, 162, 235, 0.2)",
                "rgba(255, 206, 86, 0.2)",
              ],
              borderColor: [
                "rgba(40, 100, 255, 1)",
                "rgba(255, 99, 132, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });

      const ctxx = document.getElementById("myChart2").getContext("2d");
      const myChart2 = new Chart(ctxx, {
        type: "line",
        data: {
          labels: chartDatas.month,
          datasets: [
            {
              label: "Monthly Sales Report",
              data: chartDatas.monthlyAmount,
              backgroundColor: [
                "rgba(255, 30, 100, 1)",
                "rgba(54, 100, 235, 1)",
                "rgba(255, 106, 86, 1)",
                "rgba(0, 192, 192, 1)",
                "rgba(153, 40, 255, 1)",
                "rgba(255, 159, 64, 1)",
              ],
              borderColor: [
                "rgba(40, 100, 255, 1)",
                "rgba(255, 99, 132, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });

      const ctxxx = document.getElementById("myChart3").getContext("2d");
      const myChart3 = new Chart(ctxxx, {
        type: "bar",
        data: {
          labels: chartDatas.year,
          datasets: [
            {
              label: "Yearly Sales Report",
              data: chartDatas.yearlyAmount,
              backgroundColor: [
                "rgba(255, 30, 100, 1)",
                "rgba(54, 100, 235, 1)",
                "rgba(255, 106, 86, 1)",
                "rgba(0, 192, 192, 1)",
                "rgba(153, 40, 255, 1)",
                "rgba(255, 159, 64, 1)",
              ],
              borderColor: [
                "rgba(40, 100, 255, 1)",
                "rgba(255, 99, 132, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    },
  });
}

// Dashboard

function dashboard() {
  let cardColor, headingColor, axisColor, shadeColor, borderColor;

  cardColor = config.colors.white;
  headingColor = config.colors.headingColor;
  axisColor = config.colors.axisColor;
  borderColor = config.colors.borderColor;
  $.ajax({
    url: "/admin/getChartData",
    method: "get",
    success: async (chartDatas) => {
      console.log(chartDatas);
      // Growth Chart - Radial Bar Chart
      // --------------------------------------------------------------------
      document.querySelector("#growthtext").innerHTML = chartDatas.growth;
      //   sales count
      document.querySelector("#salesId").innerHTML = chartDatas.sales;
      //
      //   Growth in resent year
      document.querySelector("#growthYearNow").innerHTML = chartDatas.year[0];
      //
      //   Growth in resent year amount
      document.querySelector("#growthAmntNow").innerHTML =
        chartDatas.yearlyAmount[0];
      //
      //   Growth in previous year
      document.querySelector("#growthPreviousYear").innerHTML = chartDatas.year[1];
      //
      //   Growth in previous year amount
      document.querySelector("#growthPreviousYearAmnt").innerHTML = chartDatas.yearlyAmount[1];
      //
      //   Profit this month
      document.querySelector("#profit").innerHTML = chartDatas.profit;
      //
      //   sales this month
      document.querySelector("#salesThisMonth").innerHTML = chartDatas.grow[0];
      //
      //  Transactions
      document.querySelector("#transactions").innerHTML = chartDatas.transaction;
       //  Payments
       document.querySelector("#payments").innerHTML = chartDatas.payments;
      //  statsticsSales
      document.querySelector("#statsticsSales").innerHTML = chartDatas.grow[0];
      // Total wallet
      document.querySelector('#wallet').innerHTML = chartDatas.wallet
      // Total users
      document.querySelector('#totalUsers').innerHTML = chartDatas.users

      const growthChartEl = document.querySelector("#growthChart"),
        growthChartOptions = {
          series: [chartDatas.growth],
          labels: ["Growth"],
          chart: {
            height: 240,
            type: "radialBar",
          },
          plotOptions: {
            radialBar: {
              size: 150,
              offsetY: 10,
              startAngle: -150,
              endAngle: 150,
              hollow: {
                size: "55%",
              },
              track: {
                background: cardColor,
                strokeWidth: "100%",
              },
              dataLabels: {
                name: {
                  offsetY: 15,
                  color: headingColor,
                  fontSize: "15px",
                  fontWeight: "600",
                  fontFamily: "Public Sans",
                },
                value: {
                  offsetY: -25,
                  color: headingColor,
                  fontSize: "22px",
                  fontWeight: "500",
                  fontFamily: "Public Sans",
                },
              },
            },
          },
          colors: [config.colors.primary],
          fill: {
            type: "gradient",
            gradient: {
              shade: "dark",
              shadeIntensity: 0.5,
              gradientToColors: [config.colors.primary],
              inverseColors: true,
              opacityFrom: 1,
              opacityTo: 0.6,
              stops: [30, 70, 100],
            },
          },
          stroke: {
            dashArray: 5,
          },
          grid: {
            padding: {
              top: -35,
              bottom: -10,
            },
          },
          states: {
            hover: {
              filter: {
                type: "none",
              },
            },
            active: {
              filter: {
                type: "none",
              },
            },
          },
        };
      if (typeof growthChartEl !== undefined && growthChartEl !== null) {
        const growthChart = new ApexCharts(growthChartEl, growthChartOptions);
        growthChart.render();
      }

      // Profit Report Line Chart
      // --------------------------------------------------------------------
      const profileReportChartEl = document.querySelector(
        "#profileReportChart"
      ),
        profileReportChartConfig = {
          chart: {
            height: 80,
            // width: 175,
            type: "line",
            toolbar: {
              show: false,
            },
            dropShadow: {
              enabled: true,
              top: 10,
              left: 5,
              blur: 3,
              color: config.colors.warning,
              opacity: 0.15,
            },
            sparkline: {
              enabled: true,
            },
          },
          grid: {
            show: false,
            padding: {
              right: 8,
            },
          },
          colors: [config.colors.warning],
          dataLabels: {
            enabled: false,
          },
          stroke: {
            width: 5,
            curve: "smooth",
          },
          series: [
            {
              data: [110, 270, 145, 245, 205, 285],
            },
          ],
          xaxis: {
            show: false,
            lines: {
              show: false,
            },
            labels: {
              show: false,
            },
            axisBorder: {
              show: false,
            },
          },
          yaxis: {
            show: false,
          },
        };
      if (
        typeof profileReportChartEl !== undefined &&
        profileReportChartEl !== null
      ) {
        const profileReportChart = new ApexCharts(
          profileReportChartEl,
          profileReportChartConfig
        );
        profileReportChart.render();
      }
      // Order Statistics Chart
      // --------------------------------------------------------------------

      const ctx8 = document.getElementById("orderStatisticsChart5").getContext("2d");
      const orderStatisticsChart5 = new Chart(ctx8, {
        type: "bar",
        data: {
          labels: chartDatas.year,
          datasets: [
            {
              label: "Yearly Sales Report",
              data: chartDatas.yearlyAmount,
              backgroundColor: [
                "rgba(255, 30, 100, 1)",
                "rgba(54, 100, 235, 1)",
                "rgba(255, 106, 86, 1)",
                "rgba(0, 192, 192, 1)",
                "rgba(153, 40, 255, 1)",
                "rgba(255, 159, 64, 1)",
              ],
              borderColor: [
                "rgba(40, 100, 255, 1)",
                "rgba(255, 99, 132, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });

      const chartOrderStatistics = document.querySelector(
        "#"
      ),
        orderChartConfig = {
          chart: {
            height: 165,
            width: 130,
            type: "donut",
          },
          labels: ["Electronic", "Sports", "Decor", "Fashion"],
          series: [85, 15, 50, 50],
          colors: [
            config.colors.primary,
            config.colors.secondary,
            config.colors.info,
            config.colors.success,
          ],
          stroke: {
            width: 5,
            colors: cardColor,
          },
          dataLabels: {
            enabled: false,
            formatter: function (val, opt) {
              return parseInt(val) + "%";
            },
          },
          legend: {
            show: false,
          },
          grid: {
            padding: {
              top: 0,
              bottom: 0,
              right: 15,
            },
          },
          plotOptions: {
            pie: {
              donut: {
                size: "75%",
                labels: {
                  show: true,
                  value: {
                    fontSize: "1.5rem",
                    fontFamily: "Public Sans",
                    color: headingColor,
                    offsetY: -15,
                    formatter: function (val) {
                      return parseInt(val) + "%";
                    },
                  },
                  name: {
                    offsetY: 20,
                    fontFamily: "Public Sans",
                  },
                  total: {
                    show: true,
                    fontSize: "0.8125rem",
                    color: axisColor,
                    label: "Weekly",
                    formatter: function (w) {
                      return "38%";
                    },
                  },
                },
              },
            },
          },
        };
      if (
        typeof chartOrderStatistics !== undefined &&
        chartOrderStatistics !== null
      ) {
        const statisticsChart = new ApexCharts(
          chartOrderStatistics,
          orderChartConfig
        );
        statisticsChart.render();
      }

      // Income Chart - Area chart
      // --------------------------------------------------------------------
      const incomeChartEl = document.querySelector("#incomeChart"),
        incomeChartConfig = {
          series: [
            {
              data: [24, 21, 30, 22, 42, 26, 35, 29],
            },
          ],
          chart: {
            height: 215,
            parentHeightOffset: 0,
            parentWidthOffset: 0,
            toolbar: {
              show: false,
            },
            type: "area",
          },
          dataLabels: {
            enabled: false,
          },
          stroke: {
            width: 2,
            curve: "smooth",
          },
          legend: {
            show: false,
          },
          markers: {
            size: 6,
            colors: "transparent",
            strokeColors: "transparent",
            strokeWidth: 4,
            discrete: [
              {
                fillColor: config.colors.white,
                seriesIndex: 0,
                dataPointIndex: 7,
                strokeColor: config.colors.primary,
                strokeWidth: 2,
                size: 6,
                radius: 8,
              },
            ],
            hover: {
              size: 7,
            },
          },
          colors: [config.colors.primary],
          fill: {
            type: "gradient",
            gradient: {
              shade: shadeColor,
              shadeIntensity: 0.6,
              opacityFrom: 0.5,
              opacityTo: 0.25,
              stops: [0, 95, 100],
            },
          },
          grid: {
            borderColor: borderColor,
            strokeDashArray: 3,
            padding: {
              top: -20,
              bottom: -8,
              left: -10,
              right: 8,
            },
          },
          xaxis: {
            categories: ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
            axisBorder: {
              show: false,
            },
            axisTicks: {
              show: false,
            },
            labels: {
              show: true,
              style: {
                fontSize: "13px",
                colors: axisColor,
              },
            },
          },
          yaxis: {
            labels: {
              show: false,
            },
            min: 10,
            max: 50,
            tickAmount: 4,
          },
        };
      if (typeof incomeChartEl !== undefined && incomeChartEl !== null) {
        const incomeChart = new ApexCharts(incomeChartEl, incomeChartConfig);
        incomeChart.render();
      }

      // Expenses Mini Chart - Radial Chart
      // --------------------------------------------------------------------
      const weeklyExpensesEl = document.querySelector("#expensesOfWeek"),
        weeklyExpensesConfig = {
          series: [65],
          chart: {
            width: 60,
            height: 60,
            type: "radialBar",
          },
          plotOptions: {
            radialBar: {
              startAngle: 0,
              endAngle: 360,
              strokeWidth: "8",
              hollow: {
                margin: 2,
                size: "45%",
              },
              track: {
                strokeWidth: "50%",
                background: borderColor,
              },
              dataLabels: {
                show: true,
                name: {
                  show: false,
                },
                value: {
                  formatter: function (val) {
                    return "$" + parseInt(val);
                  },
                  offsetY: 5,
                  color: "#697a8d",
                  fontSize: "13px",
                  show: true,
                },
              },
            },
          },
          fill: {
            type: "solid",
            colors: config.colors.primary,
          },
          stroke: {
            lineCap: "round",
          },
          grid: {
            padding: {
              top: -10,
              bottom: -15,
              left: -10,
              right: -10,
            },
          },
          states: {
            hover: {
              filter: {
                type: "none",
              },
            },
            active: {
              filter: {
                type: "none",
              },
            },
          },
        };
      if (typeof weeklyExpensesEl !== undefined && weeklyExpensesEl !== null) {
        const weeklyExpenses = new ApexCharts(
          weeklyExpensesEl,
          weeklyExpensesConfig
        );
        weeklyExpenses.render();
      }
    },
  });
}
