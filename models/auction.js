module.exports = (sequelize, DataTypes) => (
  sequelize.define('auction', {
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    applicationAmount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
        timestamps:true, // 생성일 기록
        paranoid:true, //삭제일복구용
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci", //두개를 같이 적어주어야 한글이 저장이 된다
        validate : {
          unknownType(){
            if(this.applicationAmount < 3000){ // applicationAmount(실시간 경매금액이 3000 보다 낮을 경우 에러) 
              throw new Error('실시간 경매 금액이 3000원 보다 커야 합니다.');
            }
          }
        }
  })
);
