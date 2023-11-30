'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable('conexao', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      remoteJid: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      conversation_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      conversation_uuid: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      csat: {
        allowNull: true,
        type: Sequelize.STRING,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable('conexao');
  },
};
