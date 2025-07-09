import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack(spacing: 20) {
            Text("Circada Widget Host")
                .font(.largeTitle)
            
            Text("Widget extension is running")
                .font(.body)
                .foregroundColor(.secondary)
            
            Text("Check your widget gallery!")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
    }
}

#Preview {
    ContentView()
}