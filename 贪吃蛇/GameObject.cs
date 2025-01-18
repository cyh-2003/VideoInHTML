using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace 贪吃蛇
{
    abstract internal class GameObject
    {
        public int x;
        public int y;
        
        static public bool operator ==(GameObject o1, GameObject o2) 
        {
            if (o1.x == o2.x && o1.y == o2.y) return true;
            return false;
        }
        static public bool operator !=(GameObject o1, GameObject o2)
        {
            if (o1.x == o2.x && o1.y == o2.y) return false;
            return true;
        }
        //
        public abstract void Draw();
    }
}
