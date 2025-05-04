//import java.io.*;
//import java.net.Socket;
//import java.nio.charset.Charset;
//import java.nio.charset.StandardCharsets;
//import java.util.Arrays;
//import java.util.Objects;
//
//public class ServerReaderThread extends Thread {
//
//    private Socket socket;
//
//    public ServerReaderThread(Socket socket) {
//        this.socket = socket;
//    }
//
//    @Override
//    public void run() {
//        try {
//            InputStream is = socket.getInputStream();
//            OutputStream os = socket.getOutputStream();
//            BufferedReader reader = new BufferedReader(new InputStreamReader(is));
//
//            char[] buffer = new char[1024];
//            int bytesRead;
//
//            while ((bytesRead = reader.read(buffer)) != -1) {
//                String str = new String(buffer, 0, bytesRead);
//                System.out.println("收到: " + str);
//                Server.str = str;
//                if (str.contains("tencent")) {
//                    System.out.println("收到微信");
//                    Server.msg = str;
//                    System.out.println(str);
//                    os.write("ok".getBytes());
//                    os.flush();
//                    os.close();
//                    socket.close();
//                    break;
//                }
//
//
//                if (str.contains("lbwnb")) {
//                    System.out.println("收到lbwnb消息");
//                    while (true) {
//                        if (!Server.msg.equals(Server.str)) {
//                            os.write(Server.msg.getBytes(StandardCharsets.UTF_8));
//                            os.flush();
//                            break;
//                        }
//                        Thread.sleep(100); // 避免 CPU 空转
//                    }
//                } else {
//                    System.out.println("进入重定向");
//                    os.write("HTTP/1.1 301 Moved Permanently\r\nLocation: http://www.shubaobaomumen.com\r\nConnection: close\r\n\r\n".getBytes());
//                    os.flush();
//                    os.close();
//                    socket.close();
//                    break;
//                }
//            }
//        } catch (Exception e) {
//            System.out.println("error");
//        }
//    }
//}
//
///*    private void sendMsg(String msg) throws Exception {
//        for (Socket server : Server.servers) {
//            OutputStream os = server.getOutputStream();
//            DataOutputStream dos = new DataOutputStream(os);
//            dos.writeUTF(msg);
//            dos.flush();
//        }
//    }*/


import java.io.*;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.Objects;

public class ServerReaderThread extends Thread {
    private final Socket socket;

    public ServerReaderThread(Socket socket) {
        this.socket = socket;
    }

    @Override
    public void run() {
        try (InputStream is = socket.getInputStream();
             OutputStream os = socket.getOutputStream();
             BufferedReader reader = new BufferedReader(new InputStreamReader(is))) {

            char[] buffer = new char[1024];
            int bytesRead;

            while ((bytesRead = reader.read(buffer)) != -1) {
                String str = new String(buffer, 0, bytesRead);
                System.out.println("收到: " + str);
                if (str.contains("tencent")) {
                    System.out.println("收到微信");
                    Server.msg = str;
                    os.write("ok".getBytes());
                    os.flush();
                    break;
                }

                if (str.contains("lbwnb")) {
                    System.out.println("收到lbwnb消息");
                    os.write(Server.msg.getBytes(StandardCharsets.UTF_8));
                    os.flush();
                    os.close();
                    socket.close();
                    break;
                } else {
                    System.out.println("进入重定向");
                    String response = "HTTP/1.1 301 Moved Permanently\r\n" +
                            "Location: http://www.shubaobaomumen.com\r\n" +
                            "Content-Type: text/html\r\n" +
                            "Content-Length: 0\r\n" +
                            "Connection: close\r\n\r\n";
                    os.write(response.getBytes());
                    os.flush();
                    return; // 退出线程
                }
            }
        } catch (Exception e) {
            System.out.println("error: " + e.getMessage());
        }
    }
}