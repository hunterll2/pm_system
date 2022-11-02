export const DateDiff = {
  inDays: function (d1, d2) {
    const t2 = d2.getTime();
    const t1 = d1.getTime();
    return Math.floor((t2 - t1) / (24 * 3600 * 1000));
  },
  inWeeks: function (d1, d2) {
    const t2 = d2.getTime();
    const t1 = d1.getTime();
    return parseInt((t2 - t1) / (24 * 3600 * 1000 * 7));
  },
  inMonths: function (d1, d2) {
    const d1Y = d1.getFullYear();
    const d2Y = d2.getFullYear();
    const d1M = d1.getMonth();
    const d2M = d2.getMonth();
    return d2M + 12 * d2Y - (d1M + 12 * d1Y);
  },
  inYears: function (d1, d2) {
    return d2.getFullYear() - d1.getFullYear();
  },
};

export const currency = {
  USD: function (val) {
    const f = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0, 
    });
    return f.format(val);
  },
};

export const GetDate = {
  ms: function (date) {
    return date.valueOf();
  },
  string: function (date, format) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
    // check from the arg
    const isString = typeof date === "string" || date instanceof String;
    const isNumber = typeof date === "number" || date instanceof Number;
    if (isString || isNumber) date = new Date(date);

    // convert
    const offset = date.getTimezoneOffset();
    date = new Date(date.getTime() - offset * 60 * 1000);

    const string = date.toISOString().split("T")[0];
    if (format === "m-d") return `${string.split("-")[1]}-${string.split("-")[2]}`;
    if (format === "mm-d") return `${months[Number(string.split("-")[1]) - 1]} ${string.split("-")[2]}`;
    if (format === "y-mm-d") return `${string.split("-")[0]} ${months[Number(string.split("-")[1]) - 1]} ${string.split("-")[2]}`;
    return string;
  },
};
