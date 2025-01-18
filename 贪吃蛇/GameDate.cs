using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace 贪吃蛇
{
    public enum Direction
    {
        up, down, left, right, nodirection
    }
    static internal class GameDate
    {
       public static Wall[] walls = new Wall[200];
       public static GameObject[] snakes = new GameObject[120];
        public static Food food = new Food();
       public  static int counts = 0;
       public static Random random = new Random();
        public static Direction dir = Direction.left;
    }
}
