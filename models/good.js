module.exports = (sequelize, DataTypes) => (
    sequelize.define('good', {
      goodName: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      goodPrice: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      // goodChoiceUser: {
      //   type: DataTypes
      // }
    }, {
        timestamps:true, // 생성일 기록
        paranoid:true, //삭제일복구용
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci", //두개를 같이 적어주어야 한글이 저장이 된다
    })
  );
  