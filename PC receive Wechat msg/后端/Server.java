//import java.net.ServerSocket;
//import java.net.Socket;
//import java.util.ArrayList;
//import java.util.List;
//
//public class Server {
//    public static List<Socket> servers = new ArrayList<>();
//    public static volatile String msg;
//    public static volatile String str;
//    public static void main(String[] args) throws Exception {
//        ServerSocket serverSocket = new ServerSocket(80);
//        while (true) {
//            Socket socket = serverSocket.accept();
//            servers.add(socket);
//            System.out.println("新的连接" + socket.getRemoteSocketAddress());
//            new ServerReaderThread(socket).start();
//        }
//    }
//}
import java.net.ServerSocket;
import java.net.Socket;
import java.util.ArrayList;
import java.util.List;

public class Server {
    public static List<Socket> servers = new ArrayList<>();
    public static volatile String msg;

    public static void main(String[] args) throws Exception {
        ServerSocket serverSocket = new ServerSocket(80);
        while (true) {
            Socket socket = serverSocket.accept();
            servers.add(socket);
            System.out.println("新的连接: " + socket.getRemoteSocketAddress());
            new ServerReaderThread(socket).start();
        }
    }
}