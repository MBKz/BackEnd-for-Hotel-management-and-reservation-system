const { Room } = require("../database/models/room");
const { RoomStatus } = require("../database/models/roomStatus");

 async function changeRoomStatus(roomNumber, status) {
  var response = {state:'', error: ''}
  // get room
  const room = await Room.findByPk(roomNumber);
  if (!room) {response.error = 'incorrect roomNumber' ; return response }
  // get status id
  const state = await RoomStatus.findOne({ where: { value: status } });
  if (!state) { response.error = 'incorrect room status' ; return response }
  // edit
  room.RoomStatusId = state.id;
  await room.save();
  response.state = state;
  return response
}

module.exports = changeRoomStatus;