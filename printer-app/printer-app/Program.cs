using System;
using System.Xml.Linq;
using System.Net.Http.Headers;
using bpac;
using System.Timers;

namespace MyProject;
class Program
{
    private const string endpoint = "http://localhost:8000/printQueue";
    private static System.Timers.Timer aTimer;
    static void Main(string[] args)
    {
        SetTimer();

        Console.WriteLine("\nPress the Enter key to exit the application...\n");
        Console.ReadLine();
        aTimer.Stop();
        aTimer.Dispose();

        Console.WriteLine("Terminating the application...");
    }

    // Set a timer to continuously get names every 5 seconds
    private static void SetTimer()
    {
        aTimer = new System.Timers.Timer(5000);
        aTimer.Elapsed += GetNames;
        aTimer.AutoReset = true;
        aTimer.Enabled = true;
    }

    private static void GetNames(System.Object source, ElapsedEventArgs e)
    {
        try
        {
            using HttpClient client = new();
            string[] names = client.GetStringAsync(endpoint).Result.Split(',', System.StringSplitOptions.RemoveEmptyEntries);
            foreach (string name in names)
            {
                Print(name);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
        }
    }

    private static void Print(string text)
    {
        string template = Directory.GetCurrentDirectory() + "\\template.LBX";
        bpac.DocumentClass doc = new DocumentClass();
        if (doc.Open(template) != false)
        {
            doc.GetObject("Text2").Text = text;
            doc.StartPrint("", PrintOptionConstants.bpoDefault);
            doc.PrintOut(1, PrintOptionConstants.bpoDefault);
            doc.EndPrint();
            doc.Close();
        }
        else
        {
            Console.WriteLine("Cannot read template file.");
        }
    }
}