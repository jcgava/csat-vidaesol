module.exports = (sequelize, DataTypes) => {
  const conexao = sequelize.define(
    'conexao',
    {
      remoteJid: DataTypes.STRING,
      conversation_id: DataTypes.INTEGER,
      conversation_uuid: DataTypes.STRING,
      csat: DataTypes.STRING,
    },
    {
      timestamps: false,
      tableName: 'conexao',
    }
  );

  return conexao;
};
