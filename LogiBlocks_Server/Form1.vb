'DarkNebula Server
'Author Name: Dustin Harris
'Author Username: dmhzmxn
'Email:dmhzmxn@gmail.com

Public Module Counsole
    Public Sub ConsoleOut(Output As String)
        ServerForm.ConsoleOutput.Text = ServerForm.ConsoleOutput.Text & "[Server] [" & Date.Now.ToString("MM/dd/yy - hh:mm:ss") & "]: " & Output & vbNewLine
    End Sub
End Module
Public Class ServerForm
    Public AppPath As String = Application.StartupPath & "\"
    Private WithEvents MyProcess As Process
    Private Delegate Sub AppendOutputTextDelegate(ByVal text As String)
    'Handle the form load
    Private Sub Form1_Load(sender As Object, e As EventArgs) Handles MyBase.Load
        'Add version info to title
        Text = "DarkNebula Server"
        'Show form
        Show()
        Try
            If Not System.IO.Directory.Exists(AppPath & "Resources") Then
                MkDir(AppPath & "Resources")
            End If
            If Not System.IO.File.Exists(AppPath & "favicon.ico") Then
                Dim iconfile As Bitmap = My.Resources.Icon.ToBitmap
                iconfile.Save(AppPath & "favicon.ico")
                ConsoleOut("Server file (favicon,ico) restored!")
            End If
            If Not System.IO.File.Exists(AppPath & "Resources\BG.png") Then
                Dim iconfile As Bitmap = My.Resources.Icon.ToBitmap
                My.Resources.BG.Save(AppPath & "Resources\BG.png")
                ConsoleOut("Server file (BG.png) restored!")
            End If
            If Not System.IO.File.Exists(AppPath & "Resources\index.html") Then
                Dim file = My.Computer.FileSystem.OpenTextFileWriter(AppPath & "Resources\index.html", True)
                file.WriteLine(My.Resources.Index)
                file.Close()
                ConsoleOut("Server file (Resources\index.html) restored!")
            End If
            If Not System.IO.File.Exists(AppPath & "Resources\server.js") Then
                Dim file = My.Computer.FileSystem.OpenTextFileWriter(AppPath & "Resources\server.js", True)
                file.WriteLine(My.Resources.server)
                file.Close()
                ConsoleOut("Server file (Resources\server.js) restored!")
            End If
        Catch ex As Exception
            ConsoleOut("Server file restoration failed!: " + ex.Message)
        End Try
        StartWebServer()
    End Sub
    Private Sub Restore_Server_Files()
        ConsoleOut("Restoring Server Files...")
        Try
            If System.IO.Directory.Exists(AppPath & "Resources") Then
                System.IO.Directory.Delete(AppPath & "Resources", True)
            End If
            If System.IO.File.Exists(AppPath & "favicon.ico") Then
                System.IO.File.Delete(AppPath & "favicon.ico")
            End If
            If Not System.IO.Directory.Exists(AppPath & "Resources") Then
                MkDir(AppPath & "Resources")
            End If
            If Not System.IO.File.Exists(AppPath & "favicon.ico") Then
                Dim iconfile As Bitmap = My.Resources.Icon.ToBitmap
                iconfile.Save(AppPath & "favicon.ico")
                ConsoleOut("Server file (favicon,ico) restored!")
            End If
            If Not System.IO.File.Exists(AppPath & "Resources\BG.png") Then
                Dim iconfile As Bitmap = My.Resources.Icon.ToBitmap
                My.Resources.BG.Save(AppPath & "Resources\BG.png")
                ConsoleOut("Server file (BG.png) restored!")
            End If
            If Not System.IO.File.Exists(AppPath & "Resources\index.html") Then
                Dim file = My.Computer.FileSystem.OpenTextFileWriter(AppPath & "Resources\index.html", True)
                file.WriteLine(My.Resources.Index)
                file.Close()
                ConsoleOut("Server file (Resources\index.html) restored!")
            End If
            If Not System.IO.File.Exists(AppPath & "Resources\server.js") Then
                Dim file = My.Computer.FileSystem.OpenTextFileWriter(AppPath & "Resources\server.js", True)
                file.WriteLine(My.Resources.server)
                file.Close()
                ConsoleOut("Server file (Resources\server.js) restored!")
            End If
        Catch ex As Exception
            ConsoleOut("Server file restoration failed!: " + ex.Message)
        End Try
    End Sub

    Private Sub StartWebServer()
        MyProcess = New Process
        ConsoleOut("Web Server Starting Up...")
        Try
            With MyProcess.StartInfo
                .FileName = "node"
                .Arguments = "Resources\server.js"
                .UseShellExecute = False
                .CreateNoWindow = True
                .RedirectStandardInput = True
                .RedirectStandardOutput = True
                .RedirectStandardError = True
            End With
            MyProcess.Start()
            MyProcess.BeginErrorReadLine()
            MyProcess.BeginOutputReadLine()
            ConsoleOut("Web server started successfully!")
            Button3.Text = "Stop Server"
        Catch ex As Exception
            ConsoleOut("Failed to start web server: " + ex.Message + vbNewLine + "Please verify that you have the latest Node.js installed from (https://nodejs.org/en/download/).")
        End Try

    End Sub
    Private Sub AppendOutputText(ByVal text As String)
        Try
            If ConsoleOutput.InvokeRequired Then
                Dim myDelegate As New AppendOutputTextDelegate(AddressOf AppendOutputText)
                Me.Invoke(myDelegate, text)
            Else
                ConsoleOutput.Text = ConsoleOutput.Text & "[Web] [" & Date.Now.ToString("MM/dd/yy - hh:mm:ss") & "]: " & text & vbNewLine
            End If
        Catch ex As Exception

        End Try
    End Sub
    Private Sub MyProcess_ErrorDataReceived(ByVal sender As Object, ByVal e As System.Diagnostics.DataReceivedEventArgs) Handles MyProcess.ErrorDataReceived
        AppendOutputText(e.Data)
    End Sub

    Private Sub MyProcess_OutputDataReceived(ByVal sender As Object, ByVal e As System.Diagnostics.DataReceivedEventArgs) Handles MyProcess.OutputDataReceived
        AppendOutputText(e.Data)
    End Sub

    Private Sub KillServer()
        Try
            MyProcess.Kill()
            ConsoleOut("Server stopped...")
        Catch ex As Exception
        End Try
        Button3.Text = "Start Server"
    End Sub
    Private Sub Form1_FormClosing(sender As Object, e As FormClosingEventArgs) Handles Me.FormClosing
        KillServer()
    End Sub

    Private Sub MyProcess_Exited(sender As Object, e As EventArgs) Handles MyProcess.Exited
        Button3.Text = "Start Server"
        ConsoleOut("Server stopped...")
    End Sub
    Private Sub ConsoleOutput_TextChanged(sender As Object, e As EventArgs) Handles ConsoleOutput.TextChanged
        ConsoleOutput.SelectionStart = ConsoleOutput.TextLength
        ConsoleOutput.ScrollToCaret()
    End Sub

    Private Sub Button2_Click(sender As Object, e As EventArgs) Handles Button2.Click
        KillServer()
        ConsoleOutput.Text = ""
        StartWebServer()
    End Sub

    Private Sub Button3_Click(sender As Object, e As EventArgs) Handles Button3.Click
        If Button3.Text = "Stop Server" Then
            KillServer()
        Else
            ConsoleOutput.Text = ""
            StartWebServer()
        End If
    End Sub

    Private Sub Button1_Click(sender As Object, e As EventArgs) Handles Button1.Click
        KillServer()
        ConsoleOutput.Text = ""
        Restore_Server_Files()
        StartWebServer()
    End Sub
End Class
