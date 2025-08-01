import {
  getPresentationWithRole,
  updateParticipantRole,
  updatePresentation
} from '../controllers/presentationSocketController.js';
import { addSlide, deleteSlide, updateSlide, getSlides } from '../controllers/slideControllerSocket.js';

export default function presentationSocket(io, socket) {
  console.log("User connected:", socket.id);

  socket.on("addSlide", async (data) => {
    try {
      const result = await addSlide(data);
      io.to(data.presentationId).emit("slideAdded", result);
    } catch (err) {
      socket.emit("slideAddError", { error: err.message });
    }
  });


  socket.on("updateSlide", async (data) => {
    try {
      const updated = await updateSlide(data);
      console.log("updateSlide")
      socket.to(data.presentationId).emit("slideUpdated", updated);
    } catch (err) {
      socket.emit("slideUpdateError", { error: err.message });
    }
  });

  socket.on("updateSlideBroadcast", async (data) => {
    try {
      const updated = await updateSlide(data);
      console.log("updateSlideBroadcast")
      io.to(data.presentationId).emit("slideUpdatedBroadcast", updated);
    } catch (err) {
      socket.emit("slideUpdateError", { error: err.message });
    }
  });

  socket.on("deleteSlide", async (data) => {
    try {
      const updated = await updatePresentation(data);
      io.to(data.presentationId).emit("slideDeleted", updated);
    } catch (err) {
      socket.emit("slideDeletedError", { error: err.message });
    }
  });


  socket.on("getSlides", async (data) => {
    try {
      const result = await getSlides(data);
      socket.emit("slidesRead", result);
    } catch (err) {
      socket.emit("slidesReadError", { error: err.message });
    }
  });

  socket.on("getPresentationWithRole", async (data, callback) => {
    try {
      const result = await getPresentationWithRole(data);
      callback({ success: true, ...result });
    } catch (err) {
      callback({ success: false, error: err.message });
    }
  });


  socket.on("updateParticipantRole", async (data) => {
    try {
      const updated = await updateParticipantRole(data);
      io.to(data.presentationId).emit("participantRoleUpdated", updated);
    } catch (err) {
      socket.emit("participantRoleUpdatedError", { error: err.message });
    }
  });


  socket.on("updatePresentation", async (data) => {
    try {
      const updated = await updatePresentation(data);
      io.to(data.presentationId).emit("presentationUpdated", updated);
    } catch (err) {
      socket.emit("presentationUpdatedError", { error: err.message });
    }
  });

  socket.on("joinPresentation", ({ presentationId, userId }) => {
    socket.join(presentationId);
    console.log(`User ${userId} joined room ${presentationId}`);
    socket.to(presentationId).emit('userJoined', { userId });
  });

  socket.on("leavePresentation", ({ presentationId, userId }) => {
    socket.leave(presentationId);
    console.log(`User ${userId} left room ${presentationId}`);
    socket.to(presentationId).emit('userLeft', { userId });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
}
