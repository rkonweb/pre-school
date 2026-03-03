import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'chat_provider.dart';
import 'models/chat_models.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/global_header.dart';
import 'package:intl/intl.dart';

class ChatScreen extends ConsumerStatefulWidget {
  const ChatScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    final conversationsAsync = ref.watch(conversationsProvider);

    return Scaffold(
      appBar: GlobalHeader(
        title: 'Chat',
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Conversations'),
            Tab(text: 'Broadcasts'),
          ],
          labelColor: Colors.black,
          indicatorColor: AppTheme.primary,
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildConversationsList(conversationsAsync),
          _buildBroadcastsList(),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showNewChatDialog(context),
        backgroundColor: AppTheme.primary,
        child: const Icon(Icons.message, color: Colors.white),
      ),
    );
  }

  Widget _buildConversationsList(AsyncValue<List<ChatConversation>> async) {
    return async.when(
      data: (conversations) {
        if (conversations.isEmpty) {
          return const Center(child: Text('No active chats.\nStart one by clicking the button below!', textAlign: TextAlign.center));
        }
        return ListView.builder(
          itemCount: conversations.length,
          itemBuilder: (context, index) {
            final conv = conversations[index];
            return ListTile(
              leading: CircleAvatar(
                backgroundImage: conv.student?.avatar != null 
                    ? NetworkImage(conv.student!.avatar!) 
                    : null,
                child: conv.student?.avatar == null 
                    ? Text(conv.student?.firstName[0] ?? '?') 
                    : null,
              ),
              title: Text(conv.student?.fullName ?? 'Unknown Student'),
              subtitle: Text(
                conv.lastMessage?.content ?? 'No messages yet',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              trailing: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                   Text(
                    DateFormat('h:mm a').format(conv.lastMessageAt),
                    style: const TextStyle(fontSize: 10, color: Colors.grey),
                  ),
                  const SizedBox(height: 4),
                  if (conv.participantType != 'BOTH')
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.blue.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        conv.participantType,
                        style: const TextStyle(fontSize: 8, color: Colors.blue, fontWeight: FontWeight.bold),
                      ),
                    ),
                ],
              ),
              onTap: () => context.push('/chat/messages/${conv.id}', extra: conv),
            );
          },
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Error: $e')),
    );
  }

  Widget _buildBroadcastsList() {
     final broadcastsAsync = ref.watch(broadcastsProvider);
     return broadcastsAsync.when(
        data: (broadcasts) {
          if (broadcasts.isEmpty) return const Center(child: Text('No broadcasts yet.'));
          return ListView.builder(
            itemCount: broadcasts.length,
            itemBuilder: (context, index) {
              final b = broadcasts[index];
              return ListTile(
                title: Text(b.title),
                subtitle: Text(b.content, maxLines: 2, overflow: TextOverflow.ellipsis),
                trailing: Chip(
                  label: Text(b.status, style: const TextStyle(fontSize: 10)),
                  backgroundColor: b.status == 'APPROVED' ? Colors.green.shade100 : Colors.orange.shade100,
                ),
              );
            }
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
     );
  }

  void _showNewChatDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) => const _NewChatSheet(),
    );
  }
}

class _NewChatSheet extends ConsumerStatefulWidget {
  const _NewChatSheet({Key? key}) : super(key: key);

  @override
  ConsumerState<_NewChatSheet> createState() => _NewChatSheetState();
}

class _NewChatSheetState extends ConsumerState<_NewChatSheet> {
  String? selectedStudentId;
  String selectedParticipant = 'BOTH';

  @override
  Widget build(BuildContext context) {
    final studentsAsync = ref.watch(studentsForChatProvider);

    return Container(
      padding: const EdgeInsets.all(20),
      height: MediaQuery.of(context).size.height * 0.7,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Start New Chat', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.close)),
            ],
          ),
          const SizedBox(height: 20),
          const Text('Select Student:', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          Expanded(
            child: studentsAsync.when(
              data: (students) => ListView.builder(
                itemCount: students.length,
                itemBuilder: (context, index) {
                  final s = students[index];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    decoration: BoxDecoration(
                      border: Border.all(color: selectedStudentId == s.id ? AppTheme.primary : Colors.grey.shade300),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: RadioListTile<String>(
                      title: Text(s.fullName),
                      subtitle: const Text('Tap to select student'),
                      value: s.id,
                      groupValue: selectedStudentId,
                      activeColor: AppTheme.primary,
                      onChanged: (val) => setState(() => selectedStudentId = val),
                    ),
                  );
                },
              ),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Text('Error: $e'),
            ),
          ),
          const SizedBox(height: 20),
          const Text('Initiate Chat With:', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          Row(
            children: [
              _participantChoice('BOTH'),
              _participantChoice('MOTHER'),
              _participantChoice('FATHER'),
            ],
          ),
          const SizedBox(height: 30),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: selectedStudentId == null ? null : () async {
                try {
                  final conv = await ref.read(conversationsProvider.notifier).createConversation(
                    selectedStudentId!,
                    selectedParticipant,
                  );
                  Navigator.pop(context);
                  context.push('/chat/messages/${conv.id}', extra: conv);
                } catch (e) {
                   ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Start Individual Chat', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ),
          const SizedBox(height: 10),
        ],
      ),
    );
  }

  Widget _participantChoice(String label) {
    return Padding(
      padding: const EdgeInsets.only(right: 8.0),
      child: ChoiceChip(
        label: Text(label),
        selected: selectedParticipant == label,
        selectedColor: AppTheme.primary.withOpacity(0.2),
        onSelected: (val) => setState(() => selectedParticipant = label),
      ),
    );
  }
}
