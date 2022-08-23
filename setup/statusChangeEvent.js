const db = require('./db');
async function run(){

     
   await db.query('DELIMITER $$ CREATE EVENT If not exists\
     `statusEvent` ON SCHEDULE EVERY \'1\' MINUTE DO BEGIN INSERT \
     into `banks`(`banks`.`accountNumber`,`banks`.`budget`) VALUE(111,111); END $$ DELIMITER ;').then().catch((err)=>{console.log(err);});
    
    
        
    
}
run();


/*  "\
    DELIMITER $$\
    \
    CREATE EVENT  statusEvent\
      ON SCHEDULE EVERY '1' DAY\
     \
    DO \
    BEGIN\
    with roomNumberToReserved(number) as \
        (select distinct roomNumber from roomreserveds rr,reservation res \
            where rr.reservationId = res.id \
            and res.checkIn <= now() -- now for date not time\
            )\
    update rooms r\
        set roomStatusId = (select id from roomstatuses where value='reserved' ) \
        where room.number in (select number FROM roomNumberToReserved);\
        \
    with roomNumberToBeFree(number) as \
        (select distinct roomNumber from roomreserveds rr,reservation res \
            where rr.reservationId = res.id \
            and res.checkOut <= now() -- now for date not time\
            )\
    update rooms r\
    set roomStatusId = (select id from roomstatuses where value='free' ) \
        where room.number in (select number FROM roomNumberToBeFree);\
    END $$\
    DELIMITER ;\
        " */