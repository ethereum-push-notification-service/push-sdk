export const formatTime = (timestamp : any) => {
    let date;
let timestamp1;
    if (typeof timestamp  === "string") {
        timestamp1 = parseInt(timestamp );
      }else{
        timestamp1 = timestamp
      }
        const time = new Date(timestamp1!);
        if (!isNaN(time.getTime())){
        const time1 = time.toLocaleTimeString('en-US');
        date = time1.slice(0, -6) + time1.slice(-2);
        }
        return date;
}