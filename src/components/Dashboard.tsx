import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './layout/Header';
import { Navigation } from './layout/Navigation';
import { RemindersBar } from './reminders/RemindersBar';
import { SearchFilters } from './filters/SearchFilters';
import { StatsCards } from './stats/StatsCards';
import { StaffCard } from './staff/StaffCard';
import { StaffTable } from './staff/StaffTable';
import { StaffModal } from './modals/StaffModal';
import { ReminderModal } from './modals/ReminderModal';
import { BlogModal } from './modals/BlogModal';
import { CalendarModal } from './modals/CalendarModal';
import { TutorialModal } from './modals/TutorialModal';
import { AppointmentBooking } from './appointments/AppointmentBooking';
import { AppointmentSchedule } from './appointments/AppointmentSchedule';
import { BlogList } from './blog/BlogList';
import { SharedCalendar } from './calendar/SharedCalendar';
import { TutorialsList } from './tutorials/TutorialsList';
import { useStaff } from '../hooks/useStaff';
import { useAppointments } from '../hooks/useAppointments';
import { useReminders } from '../hooks/useReminders';
import { useBlog } from '../hooks/useBlog';
import { useCalendar } from '../hooks/useCalendar';
import { useTutorials } from '../hooks/useTutorials';
import { ViewMode, Staff } from '../types/staff';
import { NavigationTab } from '../types/navigation';
import { BlogPost } from '../types/blog';
import { CalendarEvent } from '../types/calendar';
import { Tutorial } from '../types/tutorial';
import { Reminder } from '../types/reminder';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('staff');
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  
  // Staff modal state
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffModalMode, setStaffModalMode] = useState<'add' | 'edit'>('add');
  const [selectedStaff, setSelectedStaff] = useState<Staff | undefined>();

  // Reminder modal state
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderModalMode, setReminderModalMode] = useState<'add' | 'edit'>('add');
  const [selectedReminder, setSelectedReminder] = useState<Reminder | undefined>();

  // Blog modal state
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [blogModalMode, setBlogModalMode] = useState<'add' | 'edit'>('add');
  const [selectedPost, setSelectedPost] = useState<BlogPost | undefined>();

  // Calendar modal state
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [calendarModalMode, setCalendarModalMode] = useState<'add' | 'edit'>('add');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();

  // Tutorial modal state
  const [tutorialModalOpen, setTutorialModalOpen] = useState(false);
  const [tutorialModalMode, setTutorialModalMode] = useState<'add' | 'edit'>('add');
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | undefined>();

  const {
    staff,
    filters,
    setFilters,
    addStaff,
    updateStaff,
    deleteStaff,
    departments,
    stats
  } = useStaff();

  const {
    appointments,
    filters: appointmentFilters,
    setFilters: setAppointmentFilters,
    generateTimeSlots,
    addAppointment,
    updateAppointment,
    cancelAppointment
  } = useAppointments(staff);

  const {
    reminders,
    addReminder,
    completeReminder,
    dismissReminder
  } = useReminders();

  const {
    posts,
    filters: blogFilters,
    setFilters: setBlogFilters,
    addPost,
    updatePost,
    deletePost,
    authors: blogAuthors
  } = useBlog();

  const {
    events,
    filters: calendarFilters,
    setFilters: setCalendarFilters,
    addEvent,
    updateEvent,
    deleteEvent
  } = useCalendar();

  const {
    tutorials,
    filters: tutorialFilters,
    setFilters: setTutorialFilters,
    addTutorial,
    updateTutorial,
    deleteTutorial,
    viewTutorial,
    authors: tutorialAuthors
  } = useTutorials();

  // Staff handlers
  const handleAddStaff = () => {
    setStaffModalMode('add');
    setSelectedStaff(undefined);
    setStaffModalOpen(true);
  };

  const handleEditStaff = (staff: Staff) => {
    setStaffModalMode('edit');
    setSelectedStaff(staff);
    setStaffModalOpen(true);
  };

  const handleDeleteStaff = (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este miembro del personal?')) {
      deleteStaff(id);
    }
  };

  const handleStaffModalSave = (staffData: Omit<Staff, 'id'> | Staff) => {
    if (staffModalMode === 'add') {
      addStaff(staffData as Omit<Staff, 'id'>);
    } else if (selectedStaff) {
      updateStaff(selectedStaff.id, staffData);
    }
  };

  // Reminder handlers
  const handleAddReminder = () => {
    setReminderModalMode('add');
    setSelectedReminder(undefined);
    setReminderModalOpen(true);
  };

  const handleReminderModalSave = (reminderData: Omit<Reminder, 'id' | 'createdAt' | 'status'>) => {
    addReminder(reminderData);
  };

  // Blog handlers
  const handleAddPost = () => {
    setBlogModalMode('add');
    setSelectedPost(undefined);
    setBlogModalOpen(true);
  };

  const handleEditPost = (post: BlogPost) => {
    setBlogModalMode('edit');
    setSelectedPost(post);
    setBlogModalOpen(true);
  };

  const handleDeletePost = (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este anuncio?')) {
      deletePost(id);
    }
  };

  const handleBlogModalSave = (postData: Omit<BlogPost, 'id' | 'publishedAt' | 'updatedAt'>) => {
    if (blogModalMode === 'add') {
      addPost(postData);
    } else if (selectedPost) {
      updatePost(selectedPost.id, postData);
    }
  };

  // Calendar handlers
  const handleAddEvent = () => {
    setCalendarModalMode('add');
    setSelectedEvent(undefined);
    setCalendarModalOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setCalendarModalMode('edit');
    setSelectedEvent(event);
    setCalendarModalOpen(true);
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este evento?')) {
      deleteEvent(id);
    }
  };

  const handleCalendarModalSave = (eventData: Omit<CalendarEvent, 'id'>) => {
    if (calendarModalMode === 'add') {
      addEvent(eventData);
    } else if (selectedEvent) {
      updateEvent(selectedEvent.id, eventData);
    }
  };

  // Tutorial handlers
  const handleAddTutorial = () => {
    setTutorialModalMode('add');
    setSelectedTutorial(undefined);
    setTutorialModalOpen(true);
  };

  const handleEditTutorial = (tutorial: Tutorial) => {
    setTutorialModalMode('edit');
    setSelectedTutorial(tutorial);
    setTutorialModalOpen(true);
  };

  const handleDeleteTutorial = (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este tutorial?')) {
      deleteTutorial(id);
    }
  };

  const handleViewTutorial = (tutorial: Tutorial) => {
    viewTutorial(tutorial.id);
    // This would open a tutorial viewer - for now just show an alert
    alert(`Ver tutorial: ${tutorial.title}`);
  };

  const handleTutorialModalSave = (tutorialData: Omit<Tutorial, 'id' | 'publishedAt' | 'updatedAt' | 'views'>) => {
    if (tutorialModalMode === 'add') {
      addTutorial(tutorialData);
    } else if (selectedTutorial) {
      updateTutorial(selectedTutorial.id, tutorialData);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'staff':
        return (
          <div className="space-y-8">
            <StatsCards stats={stats} />
            
            <SearchFilters
              filters={filters}
              onFiltersChange={setFilters}
              departments={departments}
              onAddStaff={handleAddStaff}
            />

            {staff.length > 0 ? (
              viewMode === 'gallery' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {staff.map((person) => (
                    <StaffCard
                      key={person.id}
                      staff={person}
                      onEdit={handleEditStaff}
                      onDelete={handleDeleteStaff}
                    />
                  ))}
                </div>
              ) : (
                <StaffTable
                  staff={staff}
                  onEdit={handleEditStaff}
                  onDelete={handleDeleteStaff}
                />
              )
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-500 text-lg">No se encontró personal con los filtros aplicados</p>
                <p className="text-gray-400 text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
              </div>
            )}
          </div>
        );

      case 'booking':
        return (
          <AppointmentBooking
            staff={staff}
            onBookAppointment={addAppointment}
            generateTimeSlots={generateTimeSlots}
          />
        );

      case 'schedule':
        return (
          <AppointmentSchedule
            appointments={appointments}
            staff={staff}
            filters={appointmentFilters}
            onFiltersChange={setAppointmentFilters}
            onUpdateAppointment={updateAppointment}
            onCancelAppointment={cancelAppointment}
          />
        );

      case 'blog':
        return (
          <BlogList
            posts={posts}
            filters={blogFilters}
            onFiltersChange={setBlogFilters}
            onAddPost={handleAddPost}
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
            authors={blogAuthors}
          />
        );

      case 'calendar':
        return (
          <SharedCalendar
            events={events}
            filters={calendarFilters}
            onFiltersChange={setCalendarFilters}
            onAddEvent={handleAddEvent}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        );

      case 'tutorials':
        return (
          <TutorialsList
            tutorials={tutorials}
            filters={tutorialFilters}
            onFiltersChange={setTutorialFilters}
            onAddTutorial={handleAddTutorial}
            onEditTutorial={handleEditTutorial}
            onDeleteTutorial={handleDeleteTutorial}
            onViewTutorial={handleViewTutorial}
            authors={tutorialAuthors}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        viewMode={viewMode} 
        onViewModeChange={setViewMode}
        showViewToggle={activeTab === 'staff'}
      />
      
      <RemindersBar
        reminders={reminders}
        onCompleteReminder={completeReminder}
        onDismissReminder={dismissReminder}
        onAddReminder={handleAddReminder}
      />
      
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/dashboard" element={renderContent()} />
          <Route path="/staff" element={renderContent()} />
          <Route path="/booking" element={renderContent()} />
          <Route path="/schedule" element={renderContent()} />
          <Route path="/blog" element={renderContent()} />
          <Route path="/calendar" element={renderContent()} />
          <Route path="/tutorials" element={renderContent()} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      {/* All Modals */}
      <StaffModal
        isOpen={staffModalOpen}
        onClose={() => setStaffModalOpen(false)}
        onSave={handleStaffModalSave}
        staff={selectedStaff}
        mode={staffModalMode}
      />

      <ReminderModal
        isOpen={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        onSave={handleReminderModalSave}
        reminder={selectedReminder}
        mode={reminderModalMode}
      />

      <BlogModal
        isOpen={blogModalOpen}
        onClose={() => setBlogModalOpen(false)}
        onSave={handleBlogModalSave}
        post={selectedPost}
        mode={blogModalMode}
      />

      <CalendarModal
        isOpen={calendarModalOpen}
        onClose={() => setCalendarModalOpen(false)}
        onSave={handleCalendarModalSave}
        event={selectedEvent}
        mode={calendarModalMode}
      />

      <TutorialModal
        isOpen={tutorialModalOpen}
        onClose={() => setTutorialModalOpen(false)}
        onSave={handleTutorialModalSave}
        tutorial={selectedTutorial}
        mode={tutorialModalMode}
      />
    </div>
  );
}