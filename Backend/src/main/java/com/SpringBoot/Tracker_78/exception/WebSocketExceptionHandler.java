package com.SpringBoot.Tracker_78.exception;


import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

public class WebSocketExceptionHandler extends TextWebSocketHandler {
    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        // Log and handle WebSocket errors
        session.close(CloseStatus.SERVER_ERROR);
    }
}
